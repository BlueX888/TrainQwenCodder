"""
构建蒸馏请求脚本

从 Prompt 种子库构建教师模型的蒸馏请求，包含 API 上下文注入。
"""

import argparse
from pathlib import Path
from datetime import datetime

from common import (
    read_jsonl, write_jsonl, write_json,
    get_stage0_path, get_data_path, get_reports_path, ensure_dir,
    get_logger, generate_report_summary, print_progress
)
from api_bm25 import APIRetriever

logger = get_logger(__name__)

# 教师系统提示词模板路径
TEACHER_PROMPT_TEMPLATE_PATH = Path(__file__).parent.parent / 'prompts' / 'teacher_system_prompt.txt'


def load_teacher_system_prompt() -> str:
    """加载教师系统提示词模板"""
    if TEACHER_PROMPT_TEMPLATE_PATH.exists():
        return TEACHER_PROMPT_TEMPLATE_PATH.read_text(encoding='utf-8')
    else:
        logger.warning(f"Teacher prompt template not found at {TEACHER_PROMPT_TEMPLATE_PATH}")
        return "你是一个 Phaser3 游戏开发专家。\n\n{API_CONTEXT}"


def format_user_prompt(prompt: dict) -> str:
    """
    格式化用户 Prompt

    Args:
        prompt: Prompt 种子数据

    Returns:
        格式化后的用户提示词
    """
    lines = []

    # 任务描述
    lines.append(f"**任务**: {prompt.get('task', '未指定任务')}")
    lines.append("")

    # 难度
    difficulty = prompt.get('difficulty', 'medium')
    difficulty_cn = {'easy': '基础', 'medium': '中等', 'hard': '困难'}.get(difficulty, difficulty)
    lines.append(f"**难度**: {difficulty_cn}")
    lines.append("")

    # 约束条件
    constraints = prompt.get('constraints', [])
    if constraints:
        lines.append("**约束条件**:")
        for c in constraints:
            lines.append(f"- {c}")
        lines.append("")

    # 必须使用的 API
    must_use = prompt.get('must_use_apis', [])
    if must_use:
        lines.append("**必须使用的 API**:")
        for api in must_use:
            lines.append(f"- {api}")
        lines.append("")

    # 验证要点
    eval_hints = prompt.get('eval_hints', [])
    if eval_hints:
        lines.append("**验证要点**:")
        for hint in eval_hints:
            lines.append(f"- {hint}")
        lines.append("")

    lines.append("请按照系统提示的格式输出 [PLAN] 和代码。")

    return '\n'.join(lines)


def build_distill_request(
    prompt: dict,
    api_retriever: APIRetriever,
    teacher_system_prompt: str,
    version: int,
    top_k_apis: int = 20
) -> dict:
    """
    构建单条蒸馏请求

    Args:
        prompt: Prompt 种子数据
        api_retriever: API 检索器
        teacher_system_prompt: 教师系统提示词模板
        version: 版本号 (1, 2, 3...)
        top_k_apis: 检索的 API 数量

    Returns:
        蒸馏请求字典
    """
    # 检索相关 API
    relevant_apis = api_retriever.search_for_prompt(prompt, top_k_apis)
    api_context = api_retriever.format_api_context(relevant_apis, top_k_apis)

    # 构建系统提示词
    system_prompt = teacher_system_prompt.replace('{API_CONTEXT}', api_context)

    # 构建用户提示词
    user_prompt = format_user_prompt(prompt)

    return {
        'id': f"distill_{prompt['id']}_v{version}",
        'prompt_id': prompt['id'],
        'version': version,
        'system_prompt': system_prompt,
        'user_prompt': user_prompt,
        'prompt_meta': prompt,
        'api_context_injected': [api.get('symbol_id', '') for api in relevant_apis],
        'created_at': datetime.now().isoformat()
    }


def build_all_requests(
    prompts_path: str,
    output_path: str,
    api_index_path: str = None,
    versions_per_prompt: int = 3,
    top_k_apis: int = 20,
    report_path: str = None
) -> dict:
    """
    为所有 Prompt 构建蒸馏请求

    Args:
        prompts_path: Prompt 种子库路径
        output_path: 输出请求文件路径
        api_index_path: API 索引路径
        versions_per_prompt: 每个 Prompt 生成的版本数
        top_k_apis: 每个请求检索的 API 数量
        report_path: 报告输出路径

    Returns:
        构建报告
    """
    logger.info(f"Loading prompts from {prompts_path}")
    prompts = read_jsonl(prompts_path)
    logger.info(f"Loaded {len(prompts)} prompts")

    # 加载 API 检索器
    api_retriever = APIRetriever(api_index_path)

    # 加载教师提示词模板
    teacher_system_prompt = load_teacher_system_prompt()

    # 构建请求
    requests = []
    total = len(prompts) * versions_per_prompt

    for i, prompt in enumerate(prompts):
        for v in range(1, versions_per_prompt + 1):
            request = build_distill_request(
                prompt=prompt,
                api_retriever=api_retriever,
                teacher_system_prompt=teacher_system_prompt,
                version=v,
                top_k_apis=top_k_apis
            )
            requests.append(request)

        print_progress(
            (i + 1) * versions_per_prompt,
            total,
            prefix='Building requests'
        )

    # 保存请求
    ensure_dir(Path(output_path).parent)
    write_jsonl(output_path, requests)
    logger.info(f"Saved {len(requests)} requests to {output_path}")

    # 生成报告
    difficulty_dist = {}
    module_dist = {}
    for prompt in prompts:
        diff = prompt.get('difficulty', 'unknown')
        difficulty_dist[diff] = difficulty_dist.get(diff, 0) + versions_per_prompt

        for mod in prompt.get('modules', []):
            module_dist[mod] = module_dist.get(mod, 0) + versions_per_prompt

    report = generate_report_summary(
        name='distill_requests',
        total=len(requests),
        passed=len(requests),
        details={
            'prompts_count': len(prompts),
            'versions_per_prompt': versions_per_prompt,
            'top_k_apis': top_k_apis,
            'difficulty_distribution': difficulty_dist,
            'module_distribution': module_dist,
            'output_path': str(output_path)
        }
    )

    if report_path:
        write_json(report_path, report)
        logger.info(f"Saved report to {report_path}")

    return report


def main():
    parser = argparse.ArgumentParser(description='构建蒸馏请求')
    parser.add_argument(
        '--prompts', '-p',
        type=str,
        default=str(get_stage0_path('data/prompt_seeds/prompt_seeds.jsonl')),
        help='Prompt 种子库路径'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default=str(get_data_path('sft_distill/requests.jsonl')),
        help='输出请求文件路径'
    )
    parser.add_argument(
        '--api-index',
        type=str,
        default=str(get_stage0_path('data/api_index/phaser_api.jsonl')),
        help='API 索引路径'
    )
    parser.add_argument(
        '--versions', '-v',
        type=int,
        default=3,
        help='每个 Prompt 生成的版本数'
    )
    parser.add_argument(
        '--top-k',
        type=int,
        default=20,
        help='每个请求检索的 API 数量'
    )
    parser.add_argument(
        '--report',
        type=str,
        default=str(get_reports_path('distill_requests_report.json')),
        help='报告输出路径'
    )

    args = parser.parse_args()

    report = build_all_requests(
        prompts_path=args.prompts,
        output_path=args.output,
        api_index_path=args.api_index,
        versions_per_prompt=args.versions,
        top_k_apis=args.top_k,
        report_path=args.report
    )

    print(f"\n构建完成！")
    print(f"  - 总请求数: {report['total']}")
    print(f"  - 输出路径: {report['details']['output_path']}")
    print(f"  - 报告路径: {args.report}")


if __name__ == '__main__':
    main()
