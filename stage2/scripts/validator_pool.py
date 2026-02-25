"""
验证器进程池：并行调用 stage0/validator/src/cli.js

Features:
- ProcessPoolExecutor 并行 validator 调用
- 临时文件管理
- 结果缓存（code_hash + must_use_apis + reward_version）
- 可配置跳过 ESLint / Runtime
"""

import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass, field

# 注意：这些导入在 ProcessPoolExecutor 的子进程中也需要可用
# common 模块必须可被 pickle 引用
import sys
sys.path.insert(0, str(Path(__file__).parent))

from common import (
    get_stage0_path, compute_hash, JsonlCache, get_data_path,
    ensure_dir, get_logger
)

logger = get_logger(__name__)

# stage0 验证器路径
VALIDATOR_CLI = str(get_stage0_path('validator/src/cli.js'))
API_INDEX_PATH = str(get_stage0_path('data/api_index/phaser_api.jsonl'))

# 奖励版本号（修改奖励逻辑时递增，使旧缓存失效）
REWARD_VERSION = "v1.0"


@dataclass
class ValidatorResult:
    """Node.js 验证器的结构化结果"""
    parse_ok: bool = False
    lint_ok: bool = False
    api_ok: bool = False
    runtime_ok: bool = False
    errors: List[dict] = field(default_factory=list)
    warnings: List[dict] = field(default_factory=list)
    api_usage: dict = field(default_factory=lambda: {
        "hits": [], "misses": [],
        "must_use_hits": [], "must_use_misses": []
    })
    signals: dict = field(default_factory=dict)
    runtime: dict = field(default_factory=dict)
    raw: dict = field(default_factory=dict)

    @classmethod
    def from_dict(cls, d: dict) -> 'ValidatorResult':
        return cls(
            parse_ok=d.get('parse_ok', False),
            lint_ok=d.get('lint_ok', False),
            api_ok=d.get('api_ok', False),
            runtime_ok=d.get('runtime_ok', False),
            errors=d.get('errors', []),
            warnings=d.get('warnings', []),
            api_usage=d.get('api_usage', {
                "hits": [], "misses": [],
                "must_use_hits": [], "must_use_misses": []
            }),
            signals=d.get('signals', {}),
            runtime=d.get('runtime', {}),
            raw=d,
        )

    @classmethod
    def failure(cls, error_msg: str) -> 'ValidatorResult':
        return cls(
            errors=[{"code": "validator_call_failed", "message": error_msg}],
            raw={"error": error_msg},
        )


def _call_validator_subprocess(
    code: str,
    must_use_apis: List[str],
    skip_eslint: bool = False,
    skip_runtime: bool = True,
    timeout_ms: int = 1500,
    frames: int = 60,
    process_timeout: int = 30,
) -> dict:
    """
    调用 Node.js 验证器子进程。

    此函数为模块级函数（非方法），以便 ProcessPoolExecutor 可序列化。
    写临时文件 → 调用 cli.js → 解析 JSON 结果。
    """
    tmp_dir = tempfile.mkdtemp(prefix="grpo_val_")
    code_path = os.path.join(tmp_dir, "generated.js")

    try:
        with open(code_path, 'w', encoding='utf-8') as f:
            f.write(code)

        prompt_json = json.dumps(
            {"must_use_apis": must_use_apis},
            ensure_ascii=False
        )

        cmd = [
            'node', VALIDATOR_CLI,
            '--code-file', code_path,
            '--api-index', API_INDEX_PATH,
            '--prompt-json', prompt_json,
            '--timeout-ms', str(timeout_ms),
            '--frames', str(frames),
        ]
        if skip_eslint:
            cmd.append('--skip-eslint')
        if skip_runtime:
            cmd.append('--skip-runtime')

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=process_timeout,
        )

        if result.stdout.strip():
            return json.loads(result.stdout)
        else:
            return {
                "error": result.stderr or "no output",
                "parse_ok": False, "lint_ok": False,
                "api_ok": False, "runtime_ok": False
            }

    except subprocess.TimeoutExpired:
        return {
            "error": "timeout", "parse_ok": False,
            "lint_ok": False, "api_ok": False, "runtime_ok": False
        }
    except json.JSONDecodeError as e:
        return {
            "error": f"json_decode: {e}", "parse_ok": False,
            "lint_ok": False, "api_ok": False, "runtime_ok": False
        }
    except Exception as e:
        return {
            "error": str(e), "parse_ok": False,
            "lint_ok": False, "api_ok": False, "runtime_ok": False
        }
    finally:
        try:
            os.unlink(code_path)
            os.rmdir(tmp_dir)
        except OSError:
            pass


class ValidatorPool:
    """
    管理并行验证器调用与缓存。

    Usage:
        pool = ValidatorPool(max_workers=8)
        result = pool.validate_single(code, must_use_apis)
        results = pool.validate_batch([(code, must_use_apis), ...])
    """

    def __init__(
        self,
        max_workers: int = 8,
        cache_path: Optional[str] = None,
        skip_eslint: bool = False,
        skip_runtime: bool = True,
        timeout_ms: int = 1500,
        frames: int = 60,
    ):
        self.max_workers = max_workers
        self.skip_eslint = skip_eslint
        self.skip_runtime = skip_runtime
        self.timeout_ms = timeout_ms
        self.frames = frames

        cache_path = cache_path or str(get_data_path('grpo/rewards/validator_cache.jsonl'))
        ensure_dir(Path(cache_path).parent)
        self.cache = JsonlCache(cache_path, key_field='cache_key')
        logger.info(
            f"ValidatorPool: {max_workers} workers, "
            f"cache={len(self.cache)} entries, "
            f"skip_eslint={skip_eslint}, skip_runtime={skip_runtime}"
        )

    def _make_cache_key(self, code: str, must_use_apis: List[str]) -> str:
        """基于代码哈希+must_use_apis+奖励版本生成缓存 key"""
        payload = json.dumps({
            "code_hash": compute_hash(code),
            "must_use_apis": sorted(must_use_apis),
            "reward_version": REWARD_VERSION,
            "skip_eslint": self.skip_eslint,
            "skip_runtime": self.skip_runtime,
        }, sort_keys=True)
        return compute_hash(payload)

    def validate_single(
        self,
        code: str,
        must_use_apis: List[str],
    ) -> ValidatorResult:
        """验证单条代码（带缓存）"""
        cache_key = self._make_cache_key(code, must_use_apis)

        if self.cache.has(cache_key):
            cached = self.cache.get(cache_key)
            return ValidatorResult.from_dict(cached.get('result', {}))

        raw = _call_validator_subprocess(
            code=code,
            must_use_apis=must_use_apis,
            skip_eslint=self.skip_eslint,
            skip_runtime=self.skip_runtime,
            timeout_ms=self.timeout_ms,
            frames=self.frames,
        )

        result = ValidatorResult.from_dict(raw)

        self.cache.set(cache_key, {
            "code_hash": compute_hash(code),
            "result": raw,
        })

        return result

    def validate_batch(
        self,
        items: List[Tuple[str, List[str]]],
    ) -> List[ValidatorResult]:
        """
        批量并行验证代码。

        Args:
            items: [(code, must_use_apis), ...] 列表

        Returns:
            与输入同序的 ValidatorResult 列表
        """
        results = [None] * len(items)
        uncached_indices = []
        uncached_items = []

        # 先查缓存
        for i, (code, must_use_apis) in enumerate(items):
            cache_key = self._make_cache_key(code, must_use_apis)
            if self.cache.has(cache_key):
                cached = self.cache.get(cache_key)
                results[i] = ValidatorResult.from_dict(cached.get('result', {}))
            else:
                uncached_indices.append(i)
                uncached_items.append((code, must_use_apis))

        if not uncached_items:
            logger.info(f"Batch: all {len(items)} items from cache")
            return results

        logger.info(
            f"Batch: {len(items) - len(uncached_items)} cached, "
            f"{len(uncached_items)} to validate"
        )

        # 并行执行未缓存项
        with ProcessPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {}
            for idx, (code, must_use_apis) in zip(uncached_indices, uncached_items):
                future = executor.submit(
                    _call_validator_subprocess,
                    code=code,
                    must_use_apis=must_use_apis,
                    skip_eslint=self.skip_eslint,
                    skip_runtime=self.skip_runtime,
                    timeout_ms=self.timeout_ms,
                    frames=self.frames,
                )
                futures[future] = idx

            for future in as_completed(futures):
                idx = futures[future]
                code, must_use_apis = items[idx]
                try:
                    raw = future.result()
                except Exception as e:
                    raw = {
                        "error": str(e), "parse_ok": False,
                        "lint_ok": False, "api_ok": False, "runtime_ok": False
                    }

                result = ValidatorResult.from_dict(raw)
                results[idx] = result

                # 写入缓存
                cache_key = self._make_cache_key(code, must_use_apis)
                self.cache.set(cache_key, {
                    "code_hash": compute_hash(code),
                    "result": raw,
                })

        return results
