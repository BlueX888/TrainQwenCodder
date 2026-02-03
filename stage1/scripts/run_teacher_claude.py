"""
教师模型 Claude API 脚本

使用 Claude API 进行真实的教师蒸馏，生成高质量 Phaser3 代码。
"""

import json
import os
import time
import argparse
import threading
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path

try:
    from anthropic import Anthropic, APIError, RateLimitError
except ImportError:
    print("错误：未安装 anthropic 库")
    print("请运行：pip install anthropic")
    exit(1)

from common import (
    read_jsonl, iter_jsonl, append_jsonl,
    get_data_path, get_stage1_root,
    get_logger, print_progress, Checkpoint
)

logger = get_logger(__name__)

_thread_local = threading.local()


def get_thread_client(api_key: str) -> Anthropic:
    """
    获取线程内复用的 Anthropic 客户端
    """
    client = getattr(_thread_local, "client", None)
    if client is None:
        client = Anthropic(api_key=api_key)
        _thread_local.client = client
    return client


class RateLimiter:
    """
    简单全局速率限制器：保证请求起始间隔 >= min_interval
    """

    def __init__(self, min_interval: float):
        self.min_interval = max(0.0, float(min_interval))
        self._lock = threading.Lock()
        self._last_time = 0.0

    def wait(self) -> None:
        if self.min_interval <= 0:
            return
        with self._lock:
            now = time.monotonic()
            sleep_for = self.min_interval - (now - self._last_time)
            if sleep_for > 0:
                time.sleep(sleep_for)
                now = time.monotonic()
            self._last_time = now


def load_system_prompt(api_context: List[str]) -> str:
    """
    加载教师系统提示词并注入 API 上下文

    Args:
        api_context: API 上下文列表

    Returns:
        完整的系统提示词
    """
    prompt_path = get_stage1_root() / "prompts" / "teacher_system_prompt.txt"

    with open(prompt_path, 'r', encoding='utf-8') as f:
        template = f.read()

    # 格式化 API 上下文
    if api_context:
        context_text = "\n\n".join(api_context)
    else:
        context_text = "（无相关 API 参考）"

    return template.replace("{API_CONTEXT}", context_text)


def build_user_message(request: Dict) -> str:
    """
    构建用户消息

    Args:
        request: 蒸馏请求

    Returns:
        用户消息字符串
    """
    prompt_meta = request.get('prompt_meta', {})

    task = prompt_meta.get('task', '')
    difficulty = prompt_meta.get('difficulty', 'medium')
    modules = prompt_meta.get('modules', [])
    constraints = prompt_meta.get('constraints', [])

    # 构建消息
    message = f"""请实现以下 Phaser3 游戏功能：

## 任务描述
{task}

## 难度等级
{difficulty}

## 涉及模块
{', '.join(modules) if modules else '通用'}

## 约束条件
"""

    if constraints:
        for constraint in constraints:
            message += f"- {constraint}\n"
    else:
        message += "- 无特殊约束\n"

    message += "\n请按照规定格式输出 [PLAN] 和完整的 JavaScript 代码。"

    return message


def call_claude_api(
    client: Anthropic,
    system_prompt: str,
    user_message: str,
    model: str = "claude-sonnet-4-5-20250929",
    max_tokens: int = 4000,
    temperature: float = 0.7
) -> str:
    """
    调用 Claude API

    Args:
        client: Anthropic 客户端
        system_prompt: 系统提示词
        user_message: 用户消息
        model: 模型名称
        max_tokens: 最大生成 token 数
        temperature: 温度参数

    Returns:
        模型输出文本
    """
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": user_message
            }
        ]
    )

    # 提取文本内容
    return response.content[0].text


def generate_claude_output(
    request: Dict,
    client: Anthropic,
    model: str,
    max_retries: int = 3
) -> Optional[Dict]:
    """
    使用 Claude API 生成教师模型输出

    Args:
        request: 蒸馏请求
        client: Anthropic 客户端
        model: 模型名称
        max_retries: 最大重试次数

    Returns:
        输出数据，失败返回 None
    """
    # 构建提示词
    api_context = request.get('api_context_injected', [])
    system_prompt = load_system_prompt(api_context)
    user_message = build_user_message(request)

    # 重试逻辑
    for attempt in range(max_retries):
        try:
            raw_output = call_claude_api(
                client=client,
                system_prompt=system_prompt,
                user_message=user_message,
                model=model
            )

            # 构建输出数据
            return {
                'id': request.get('id', ''),
                'prompt_id': request.get('prompt_id', ''),
                'version': request.get('version', 1),
                'prompt_meta': request.get('prompt_meta', {}),
                'raw_output': raw_output,
                'output': raw_output,
                'teacher_model': model,
                'api_context_injected': api_context,
                'timestamp': datetime.now().isoformat()
            }

        except RateLimitError as e:
            wait_time = 60 * (attempt + 1)
            logger.warning(f"Rate limit reached, waiting {wait_time}s... ({attempt + 1}/{max_retries})")
            time.sleep(wait_time)

        except APIError as e:
            logger.error(f"API error: {e} (attempt {attempt + 1}/{max_retries})")
            if attempt < max_retries - 1:
                time.sleep(5)
            else:
                return None

        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return None

    return None


def collect_done_ids_from_output(
    output_path: str,
    request_id_scope: Optional[set[str]] = None
) -> tuple[set[str], int, dict[str, int]]:
    """
    从既有 output JSONL 中收集已完成的 request id（用于断点续跑/去重）。

    Args:
        output_path: 输出 JSONL 路径
        request_id_scope: 可选的 scope，仅统计在该集合内的 id

    Returns:
        (done_ids, total_lines, duplicate_counts)
    """
    path = Path(output_path)
    if not path.exists():
        return set(), 0, {}

    counts: dict[str, int] = {}
    total_lines = 0

    for item in iter_jsonl(path):
        if not isinstance(item, dict):
            continue
        total_lines += 1
        item_id = item.get('id')
        if not item_id:
            continue
        if request_id_scope is not None and item_id not in request_id_scope:
            continue
        counts[item_id] = counts.get(item_id, 0) + 1

    done_ids = set(counts.keys())
    dupes = {k: v for k, v in counts.items() if v > 1}
    return done_ids, total_lines, dupes


def dedupe_output_jsonl_inplace(output_path: str) -> dict:
    """
    按 id 对 output JSONL 去重（保留第一次出现），并生成备份文件。

    Returns:
        {
          "backup_path": str,
          "kept": int,
          "removed": int,
          "invalid_json_lines": int
        }
    """
    src = Path(output_path)
    if not src.exists():
        return {"backup_path": "", "kept": 0, "removed": 0, "invalid_json_lines": 0}

    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = str(src) + f".bak-{ts}"
    tmp_path = str(src) + f".tmp-{ts}"

    seen: set[str] = set()
    kept = 0
    removed = 0
    invalid = 0

    with open(src, "r", encoding="utf-8") as fin, open(tmp_path, "w", encoding="utf-8") as fout:
        for line in fin:
            if not line.strip():
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                invalid += 1
                fout.write(line if line.endswith("\n") else line + "\n")
                continue

            if not isinstance(obj, dict):
                fout.write(line if line.endswith("\n") else line + "\n")
                kept += 1
                continue

            item_id = obj.get("id")
            if item_id and item_id in seen:
                removed += 1
                continue
            if item_id:
                seen.add(item_id)

            fout.write(line if line.endswith("\n") else line + "\n")
            kept += 1

    os.replace(str(src), backup_path)
    os.replace(tmp_path, str(src))

    return {
        "backup_path": backup_path,
        "kept": kept,
        "removed": removed,
        "invalid_json_lines": invalid,
    }


def run_claude_distill(
    requests_path: str,
    output_path: str,
    api_key: str,
    model: str = "claude-3-5-sonnet-20241022",
    max_items: Optional[int] = None,
    checkpoint_path: Optional[str] = None,
    rate_limit_delay: float = 1.0,
    resume_from: str = "auto",
    dedupe_output: bool = False,
    concurrency: int = 1,
    max_in_flight: Optional[int] = None
) -> int:
    """
    运行 Claude API 蒸馏

    Args:
        requests_path: 请求文件路径
        output_path: 输出文件路径
        api_key: Claude API Key
        model: 模型名称
        max_items: 最大处理数量
        checkpoint_path: 检查点路径
        rate_limit_delay: 请求间隔（秒），并发时为全局请求起始间隔
        concurrency: 并发请求数（>1 可加速）
        max_in_flight: 最大在途任务数（默认=concurrency）

    Returns:
        成功生成的数量
    """
    logger.info(f"Loading requests from {requests_path}")
    requests = read_jsonl(requests_path)
    logger.info(f"Loaded {len(requests)} requests")

    if max_items:
        requests = requests[:max_items]
        logger.info(f"Limited to {max_items} requests")

    concurrency = max(1, int(concurrency))
    if max_in_flight is None:
        max_in_flight = concurrency
    else:
        max_in_flight = max(1, int(max_in_flight))

    logger.info(
        f"Using model: {model} | concurrency={concurrency} | "
        f"rate_limit_delay={rate_limit_delay}s | max_in_flight={max_in_flight}"
    )

    # 确保输出文件存在
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    if not Path(output_path).exists():
        Path(output_path).touch()

    if dedupe_output:
        dedupe_stats = dedupe_output_jsonl_inplace(output_path)
        logger.info(
            "Deduped output file (keep first per id): "
            f"kept={dedupe_stats['kept']}, removed={dedupe_stats['removed']}, "
            f"invalid_json_lines={dedupe_stats['invalid_json_lines']}, "
            f"backup={dedupe_stats['backup_path']}"
        )

    # 检查点
    checkpoint = Checkpoint(checkpoint_path) if checkpoint_path else None
    if checkpoint:
        logger.info(f"Resuming from checkpoint: {len(checkpoint)} processed")

    # 为确保断点续跑不重复计费/重复写入：优先从 output 文件同步已完成 id
    for i, request in enumerate(requests):
        if not request.get('id'):
            request['id'] = f'req_{i}'

    request_id_scope = {r['id'] for r in requests if r.get('id')}
    output_done_ids, output_lines, output_dupes = collect_done_ids_from_output(
        output_path=output_path,
        request_id_scope=request_id_scope
    )
    checkpoint_done_ids = set(checkpoint.processed) & request_id_scope if checkpoint else set()

    if output_dupes:
        logger.warning(
            f"Detected duplicated ids in output file: {len(output_dupes)} ids have duplicates. "
            f"(e.g. {next(iter(output_dupes.items()))[0]} x{next(iter(output_dupes.items()))[1]})"
        )

    if resume_from not in {"auto", "output", "checkpoint"}:
        raise ValueError("resume_from must be one of: auto, output, checkpoint")

    if resume_from == "checkpoint":
        done_ids = checkpoint_done_ids
    elif resume_from == "output":
        done_ids = output_done_ids
    else:
        # auto: output 有内容则以 output 为准，否则回退 checkpoint
        done_ids = output_done_ids if output_done_ids else checkpoint_done_ids

    # 同步 checkpoint，避免 output 已写入但 checkpoint 丢失导致重复生成
    if checkpoint and done_ids != checkpoint_done_ids and resume_from in {"auto", "output"}:
        added = len(done_ids - checkpoint_done_ids)
        removed = len(checkpoint_done_ids - done_ids)
        logger.info(f"Sync checkpoint from output: +{added}, -{removed}, total={len(done_ids)}")
        checkpoint.processed = set(done_ids)
        checkpoint.save()

    logger.info(
        f"Resume state: output_lines={output_lines}, done_in_output={len(output_done_ids)}, "
        f"done_in_checkpoint={len(checkpoint_done_ids)}, done_in_scope={len(done_ids)}, "
        f"remaining={len(requests) - len(done_ids)}"
    )

    # 统计（success_count 表示当前 scope 内累计成功数量：已有 + 新生成）
    success_count = len(done_ids)
    failed_count = 0
    completed_count = 0

    pending: list[tuple[int, dict]] = []

    for i, request in enumerate(requests):
        req_id = request.get('id', f'req_{i}')

        # 跳过已处理（output/checkpoint 任一已包含即可）
        if req_id in done_ids:
            completed_count += 1
            print_progress(completed_count, len(requests), prefix='Claude distill',
                           suffix=f'✓ {success_count} | ✗ {failed_count}')
            continue

        pending.append((len(pending), request))

    if concurrency <= 1:
        # 串行模式
        client = Anthropic(api_key=api_key)
        for idx, item in enumerate(pending):
            _, request = item
            req_id = request.get('id', '')

            # 调用 API
            output = generate_claude_output(request, client, model)

            if output:
                append_jsonl(output_path, output)
                success_count += 1
                done_ids.add(req_id)

                if checkpoint:
                    checkpoint.mark_done(req_id)
                    checkpoint.save()  # 每条成功后立即保存，支持真正的断点续传
            else:
                failed_count += 1
                logger.error(f"Failed to generate output for request {req_id}")

            completed_count += 1
            print_progress(completed_count, len(requests), prefix='Claude distill',
                           suffix=f'✓ {success_count} | ✗ {failed_count}')

            # 速率限制
            if idx < len(pending) - 1:
                time.sleep(rate_limit_delay)
    else:
        # 并发模式
        rate_limiter = RateLimiter(rate_limit_delay)

        def worker(req: dict) -> Optional[dict]:
            rate_limiter.wait()
            client = get_thread_client(api_key)
            return generate_claude_output(req, client, model)

        with ThreadPoolExecutor(max_workers=concurrency) as executor:
            pending_iter = iter(pending)
            futures: dict = {}
            ordered_buffer: dict[int, tuple[Optional[dict], str]] = {}
            next_write_index = 0

            def submit_one() -> bool:
                try:
                    order_index, req = next(pending_iter)
                except StopIteration:
                    return False
                req_id = req.get('id', '')
                futures[executor.submit(worker, req)] = (order_index, req_id)
                return True

            for _ in range(min(max_in_flight, len(pending))):
                submit_one()

            while futures:
                done, _ = wait(futures, return_when=FIRST_COMPLETED)
                for future in done:
                    order_index, req_id = futures.pop(future)
                    try:
                        output = future.result()
                    except Exception as e:
                        logger.error(f"Unexpected error for request {req_id}: {e}")
                        output = None
                    ordered_buffer[order_index] = (output, req_id)

                    while next_write_index in ordered_buffer:
                        buffered_output, buffered_id = ordered_buffer.pop(next_write_index)
                        if buffered_output:
                            append_jsonl(output_path, buffered_output)
                            success_count += 1
                            done_ids.add(buffered_id)

                            if checkpoint:
                                checkpoint.mark_done(buffered_id)
                                checkpoint.save()
                        else:
                            failed_count += 1
                            logger.error(f"Failed to generate output for request {buffered_id}")

                        completed_count += 1
                        print_progress(completed_count, len(requests), prefix='Claude distill',
                                       suffix=f'✓ {success_count} | ✗ {failed_count}')
                        next_write_index += 1

                    submit_one()

    if checkpoint:
        checkpoint.save()

    logger.info(f"Distillation complete: {success_count} success, {failed_count} failed")
    return success_count


def main():
    parser = argparse.ArgumentParser(
        description='使用 Claude API 运行教师蒸馏',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例用法：

  # 基础使用（需要设置环境变量 ANTHROPIC_API_KEY）
  python run_teacher_claude.py

  # 指定 API Key
  python run_teacher_claude.py --api-key sk-ant-xxxxx

  # 测试模式（只处理 10 条）
  python run_teacher_claude.py --max-items 10

  # 使用 Opus 模型（更强但更贵）
  python run_teacher_claude.py --model claude-opus-4-20250514

  # 自定义速率限制（每秒 0.5 个请求）
  python run_teacher_claude.py --rate-limit-delay 2.0

环境变量：
  ANTHROPIC_API_KEY    Claude API 密钥（如果未通过 --api-key 指定）
        """
    )

    parser.add_argument(
        '--requests', '-r',
        type=str,
        default=str(get_data_path('sft_distill/requests.jsonl')),
        help='请求文件路径'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default=str(get_data_path('sft_distill/raw_outputs_claude.jsonl')),
        help='输出文件路径'
    )
    parser.add_argument(
        '--api-key',
        type=str,
        default=None,
        help='Claude API Key（不指定则从环境变量 ANTHROPIC_API_KEY 读取）'
    )
    parser.add_argument(
        '--model', '-m',
        type=str,
        default='claude-sonnet-4-5-20250929',
        choices=[
            'claude-3-5-sonnet-20241022',
            'claude-3-5-sonnet-20250122',
            'claude-opus-4-20250514',
            'claude-3-7-sonnet-20250219',
            'claude-sonnet-4-5-20250929'
        ],
        help='Claude 模型名称'
    )
    parser.add_argument(
        '--max-items', '-n',
        type=int,
        default=None,
        help='最大处理数量（用于测试）'
    )
    parser.add_argument(
        '--checkpoint',
        type=str,
        default=str(get_data_path('sft_distill/checkpoint_claude.json')),
        help='检查点文件路径'
    )
    parser.add_argument(
        '--rate-limit-delay',
        type=float,
        default=1.0,
        help='请求间隔秒数（并发时为全局请求起始间隔，默认 1.0 秒）'
    )
    parser.add_argument(
        '--concurrency',
        type=int,
        default=1,
        help='并发请求数（>1 可加速，注意速率限制）'
    )
    parser.add_argument(
        '--max-in-flight',
        type=int,
        default=None,
        help='最大在途任务数（默认=concurrency）'
    )
    parser.add_argument(
        '--resume-from',
        type=str,
        default='auto',
        choices=['auto', 'output', 'checkpoint'],
        help='断点续跑基准：auto=优先 output，否则 checkpoint；output=以输出文件为准；checkpoint=只看检查点'
    )
    parser.add_argument(
        '--dedupe-output',
        action='store_true',
        help='启动时对输出 JSONL 按 id 去重（保留第一次出现），并生成 .bak 备份'
    )

    args = parser.parse_args()

    # 获取 API Key
    api_key = args.api_key or os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        print("错误：未提供 API Key")
        print("请通过以下方式之一提供：")
        print("  1. 命令行参数：--api-key sk-ant-xxxxx")
        print("  2. 环境变量：export ANTHROPIC_API_KEY=sk-ant-xxxxx")
        exit(1)

    # 估算成本
    requests = read_jsonl(args.requests)
    total_requests = min(len(requests), args.max_items) if args.max_items else len(requests)

    # 成本估算（粗略）
    if 'sonnet-4-5' in args.model.lower():
        cost_per_request = 0.015
        model_name = "Sonnet 4.5"
    elif 'sonnet' in args.model.lower():
        cost_per_request = 0.015  # $0.015/请求（约 3000 input + 2000 output tokens）
        model_name = "Sonnet 3.5"
    elif 'opus' in args.model.lower():
        cost_per_request = 0.075  # $0.075/请求
        model_name = "Opus 4"
    else:
        cost_per_request = 0.01
        model_name = "Unknown"

    estimated_cost = total_requests * cost_per_request
    effective_concurrency = max(1, int(args.concurrency))
    estimated_time = total_requests * (args.rate_limit_delay + 2) / effective_concurrency

    print(f"\n{'='*60}")
    print(f"Claude API 蒸馏任务")
    print(f"{'='*60}")
    print(f"模型：{model_name} ({args.model})")
    print(f"请求数量：{total_requests}")
    print(f"预估成本：${estimated_cost:.2f} USD")
    print(f"预估时间：{estimated_time/60:.1f} 分钟")
    print(f"{'='*60}\n")

    # 确认
    if total_requests > 100:
        confirm = input("请求数量较多，确认继续？(yes/no): ")
        if confirm.lower() not in ['yes', 'y']:
            print("已取消")
            return

    # 开始蒸馏
    start_time = time.time()

    count = run_claude_distill(
        requests_path=args.requests,
        output_path=args.output,
        api_key=api_key,
        model=args.model,
        max_items=args.max_items,
        checkpoint_path=args.checkpoint,
        rate_limit_delay=args.rate_limit_delay,
        resume_from=args.resume_from,
        dedupe_output=args.dedupe_output,
        concurrency=args.concurrency,
        max_in_flight=args.max_in_flight
    )

    elapsed = time.time() - start_time

    print(f"\n{'='*60}")
    print(f"Claude 蒸馏完成！")
    print(f"{'='*60}")
    print(f"  - 成功生成：{count}/{total_requests}")
    print(f"  - 耗时：{elapsed/60:.1f} 分钟")
    print(f"  - 输出路径：{args.output}")
    print(f"  - 检查点：{args.checkpoint}")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
