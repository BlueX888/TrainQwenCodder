#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from common import append_jsonl, iter_jsonl, sha256_text


@dataclass
class ValidatorConfig:
    validator_cli: Path
    api_index: Path
    timeout_ms: int = 1500
    frames: int = 60
    skip_eslint: bool = False
    skip_runtime: bool = False


def cache_key(code_hash: str, must_use_checks: List[str], cfg: ValidatorConfig) -> str:
    norm = [str(x).strip() for x in must_use_checks if str(x).strip()]
    norm.sort()
    return sha256_text(
        json.dumps(
            {
                "code_hash": code_hash,
                "must_use": norm,
                "skip_eslint": bool(cfg.skip_eslint),
                "skip_runtime": bool(cfg.skip_runtime),
                "timeout_ms": int(cfg.timeout_ms),
                "frames": int(cfg.frames),
            },
            ensure_ascii=False,
            sort_keys=True,
        )
    )


def load_cache(path: Optional[Path]) -> Dict[str, Dict[str, Any]]:
    if not path or not path.exists():
        return {}
    out: Dict[str, Dict[str, Any]] = {}
    for row in iter_jsonl(path):
        k = str(row.get("key", "")).strip()
        v = row.get("validator")
        if k and isinstance(v, dict):
            out[k] = v
    return out


def run_validator(
    *,
    cfg: ValidatorConfig,
    code_file: Path,
    must_use_checks: List[str],
) -> Tuple[bool, Dict[str, Any], str]:
    cmd = [
        "node",
        str(cfg.validator_cli),
        "--code-file",
        str(code_file),
        "--api-index",
        str(cfg.api_index),
        "--prompt-json",
        json.dumps({"must_use_apis": must_use_checks}, ensure_ascii=False),
        "--timeout-ms",
        str(int(cfg.timeout_ms)),
        "--frames",
        str(int(cfg.frames)),
    ]
    if cfg.skip_eslint:
        cmd.append("--skip-eslint")
    if cfg.skip_runtime:
        cmd.append("--skip-runtime")

    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    stderr = (p.stderr or "").strip()
    out = (p.stdout or "").strip()
    if p.returncode != 0:
        return False, {}, stderr or f"validator_exit_{p.returncode}"
    if not out:
        return False, {}, stderr or "validator_empty_stdout"
    try:
        obj = json.loads(out)
    except json.JSONDecodeError as e:
        return False, {}, f"validator_output_not_json: {e}"
    if not isinstance(obj, dict):
        return False, {}, "validator_output_not_object"
    return True, obj, stderr


def validate_with_cache(
    *,
    cfg: ValidatorConfig,
    code: str,
    must_use_checks: List[str],
    cache_path: Optional[Path],
    code_dir: Optional[Path],
    save_codes: bool,
    cache: Dict[str, Dict[str, Any]],
    meta: Dict[str, Any],
) -> Dict[str, Any]:
    code_hash = sha256_text(code or "")
    k = cache_key(code_hash, must_use_checks, cfg)
    v = cache.get(k)
    if v is not None:
        return {"code_hash": code_hash, "cache_key": k, "validator": v, "cached": True}

    if save_codes and code_dir is not None:
        code_dir.mkdir(parents=True, exist_ok=True)
        code_file = code_dir / f"{code_hash}.js"
    else:
        tmp_dir = (cache_path.parent if cache_path else Path(meta.get("tmp_dir", ".")).resolve())
        tmp_dir.mkdir(parents=True, exist_ok=True)
        code_file = tmp_dir / f"__tmp_{code_hash}.js"

    code_file.write_text((code or "") + "\n", encoding="utf-8")

    ok, v, err = run_validator(cfg=cfg, code_file=code_file, must_use_checks=must_use_checks)
    if not save_codes:
        try:
            code_file.unlink()
        except OSError:
            pass

    if not ok:
        v = {
            "parse_ok": False,
            "lint_ok": False,
            "api_ok": False,
            "runtime_ok": False,
            "errors": [{"code": "validator_failed", "message": err}],
            "warnings": [],
            "api_usage": {"hits": [], "misses": [], "must_use_hits": [], "must_use_misses": must_use_checks},
            "runtime": {"ms": 0, "crashed": True, "logs": [], "errors": [err], "signals": {}},
            "signals": {},
        }

    cache[k] = v
    if cache_path is not None:
        append_jsonl(
            cache_path,
            {
                "key": k,
                "code_hash": code_hash,
                "must_use_checks": must_use_checks,
                "validator": v,
                "meta": meta,
            },
        )

    return {"code_hash": code_hash, "cache_key": k, "validator": v, "cached": False}

