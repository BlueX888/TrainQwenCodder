"""
教师模型 Claude API 脚本

使用 Claude API 进行真实的教师蒸馏，生成高质量 Phaser3 代码。
"""

import os
import time
import argparse
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
    read_jsonl, append_jsonl,
    get_data_path, get_stage1_root,
    get_logger, print_progress, Checkpoint
)

logger = get_logger(__name__)


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


def run_claude_distill(
    requests_path: str,
    output_path: str,
    api_key: str,
    model: str = "claude-3-5-sonnet-20241022",
    max_items: Optional[int] = None,
    checkpoint_path: Optional[str] = None,
    rate_limit_delay: float = 1.0
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
        rate_limit_delay: 请求间隔（秒）

    Returns:
        成功生成的数量
    """
    logger.info(f"Loading requests from {requests_path}")
    requests = read_jsonl(requests_path)
    logger.info(f"Loaded {len(requests)} requests")

    if max_items:
        requests = requests[:max_items]
        logger.info(f"Limited to {max_items} requests")

    # 初始化 Claude 客户端
    client = Anthropic(api_key=api_key)
    logger.info(f"Using model: {model}")

    # 确保输出文件存在
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    if not Path(output_path).exists():
        Path(output_path).touch()

    # 检查点
    checkpoint = Checkpoint(checkpoint_path) if checkpoint_path else None
    if checkpoint:
        logger.info(f"Resuming from checkpoint: {len(checkpoint)} processed")

    # 统计
    success_count = 0
    failed_count = 0

    for i, request in enumerate(requests):
        req_id = request.get('id', f'req_{i}')

        # 跳过已处理
        if checkpoint and checkpoint.is_done(req_id):
            success_count += 1
            print_progress(i + 1, len(requests), prefix='Claude distill',
                         suffix=f'✓ {success_count} | ✗ {failed_count}')
            continue

        # 调用 API
        output = generate_claude_output(request, client, model)

        if output:
            append_jsonl(output_path, output)
            success_count += 1

            if checkpoint:
                checkpoint.mark_done(req_id)
                if (i + 1) % 10 == 0:
                    checkpoint.save()
        else:
            failed_count += 1
            logger.error(f"Failed to generate output for request {req_id}")

        print_progress(i + 1, len(requests), prefix='Claude distill',
                      suffix=f'✓ {success_count} | ✗ {failed_count}')

        # 速率限制
        if i < len(requests) - 1:
            time.sleep(rate_limit_delay)

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
        help='请求间隔秒数（避免触发速率限制，默认 1.0 秒）'
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
    estimated_time = total_requests * (args.rate_limit_delay + 2)  # 2秒平均响应时间

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
        rate_limit_delay=args.rate_limit_delay
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
