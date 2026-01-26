"""
SFT 数据集构建脚本

整合蒸馏数据和官方/开源数据，构建最终的 SFT 数据集：
1. 格式统一（转换为 LLaMA-Factory 格式）
2. 全局去重
3. 数据集划分 (train/val/test)
"""

import random
import argparse
from collections import defaultdict
from pathlib import Path

from common import (
    read_jsonl, write_jsonl, write_json,
    get_data_path, get_reports_path, ensure_dir,
    get_logger, generate_report_summary, print_progress,
    normalize_code, compute_hash
)

logger = get_logger(__name__)

# 系统指令
SYSTEM_INSTRUCTION = """你是一个 Phaser3 游戏开发专家。请根据用户的任务描述，先输出结构化计划 [PLAN]，然后输出完整的 Phaser3 代码。

输出格式要求：
1. 先输出 [PLAN]...[/PLAN] 块，包含需求摘要、API 列表和步骤
2. 然后输出完整的 JavaScript 代码（使用 ```javascript 包裹）
3. 代码必须可独立运行，包含完整的 Game 配置和 Scene 生命周期"""


def format_input(prompt: dict) -> str:
    """格式化输入（任务描述）"""
    lines = []

    # 任务
    task = prompt.get('task', '')
    lines.append(f"任务: {task}")
    lines.append("")

    # 难度
    difficulty = prompt.get('difficulty', 'medium')
    difficulty_cn = {'easy': '基础', 'medium': '中等', 'hard': '困难'}.get(difficulty, difficulty)
    lines.append(f"难度: {difficulty_cn}")
    lines.append("")

    # 约束
    constraints = prompt.get('constraints', [])
    if constraints:
        lines.append("约束:")
        for c in constraints:
            lines.append(f"- {c}")
        lines.append("")

    # 必须使用的 API
    must_use = prompt.get('must_use_apis', [])
    if must_use:
        lines.append("必须使用的 API:")
        for api in must_use:
            lines.append(f"- {api}")

    return '\n'.join(lines)


def format_output(plan: dict, code: str) -> str:
    """格式化输出（Plan + Code）"""
    lines = []

    # Plan 块
    if plan:
        lines.append("[PLAN]")
        if plan.get('requirements'):
            lines.append(f"REQ: {plan['requirements']}")
        if plan.get('apis'):
            lines.append(f"API: {', '.join(plan['apis'])}")
        if plan.get('steps'):
            lines.append("STEPS:")
            for step in plan['steps']:
                lines.append(step)
        lines.append("[/PLAN]")
        lines.append("")

    # Code 块
    lines.append("```javascript")
    lines.append(code.strip())
    lines.append("```")

    return '\n'.join(lines)


def convert_to_sft_format(candidate: dict, source: str = 'distill') -> dict:
    """
    将候选数据转换为 SFT 格式（LLaMA-Factory 兼容）

    Args:
        candidate: 候选数据
        source: 数据来源标记

    Returns:
        SFT 格式数据
    """
    prompt = candidate.get('prompt', {})
    plan = candidate.get('plan', {})
    code = candidate.get('code', '')

    return {
        'instruction': SYSTEM_INSTRUCTION,
        'input': format_input(prompt),
        'output': format_output(plan, code),
        'metadata': {
            'id': candidate.get('id', ''),
            'prompt_id': candidate.get('prompt_id', ''),
            'source': source,
            'difficulty': prompt.get('difficulty', 'unknown'),
            'modules': prompt.get('modules', []),
            'quality_score': candidate.get('quality_score', 0)
        }
    }


def deduplicate_by_code(items: list[dict], threshold: float = 0.95) -> list[dict]:
    """
    基于代码相似度去重

    Args:
        items: SFT 数据列表
        threshold: 相似度阈值

    Returns:
        去重后的列表
    """
    if len(items) <= 1:
        return items

    # 使用代码哈希快速去重
    seen_hashes = set()
    unique = []

    for item in items:
        # 提取代码
        output = item.get('output', '')
        code_start = output.find('```javascript')
        code_end = output.rfind('```')
        if code_start != -1 and code_end != -1:
            code = output[code_start + 13:code_end].strip()
        else:
            code = output

        # 规范化并计算哈希
        code_norm = normalize_code(code)
        code_hash = compute_hash(code_norm)

        if code_hash not in seen_hashes:
            seen_hashes.add(code_hash)
            unique.append(item)

    return unique


def stratified_split(
    items: list[dict],
    train_ratio: float = 0.9,
    val_ratio: float = 0.05,
    test_ratio: float = 0.05,
    seed: int = 42
) -> tuple[list[dict], list[dict], list[dict]]:
    """
    分层划分数据集

    按难度和来源分层，确保各子集分布一致

    Args:
        items: SFT 数据列表
        train_ratio: 训练集比例
        val_ratio: 验证集比例
        test_ratio: 测试集比例
        seed: 随机种子

    Returns:
        (train, val, test) 三元组
    """
    random.seed(seed)

    # 按分层键分组
    def get_stratum_key(item):
        meta = item.get('metadata', {})
        difficulty = meta.get('difficulty', 'unknown')
        source = meta.get('source', 'unknown')
        return f"{difficulty}_{source}"

    strata = defaultdict(list)
    for item in items:
        key = get_stratum_key(item)
        strata[key].append(item)

    train, val, test = [], [], []

    for key, stratum_items in strata.items():
        random.shuffle(stratum_items)
        n = len(stratum_items)

        n_val = max(1, int(n * val_ratio)) if n > 2 else 0
        n_test = max(1, int(n * test_ratio)) if n > 2 else 0
        n_train = n - n_val - n_test

        train.extend(stratum_items[:n_train])
        val.extend(stratum_items[n_train:n_train + n_val])
        test.extend(stratum_items[n_train + n_val:])

    # 打乱各集合
    random.shuffle(train)
    random.shuffle(val)
    random.shuffle(test)

    return train, val, test


def build_sft_dataset(
    distill_path: str,
    official_path: str = None,
    output_dir: str = None,
    train_ratio: float = 0.9,
    val_ratio: float = 0.05,
    test_ratio: float = 0.05,
    seed: int = 42,
    report_path: str = None
) -> dict:
    """
    构建 SFT 数据集

    Args:
        distill_path: 蒸馏数据文件路径
        official_path: 官方/开源数据文件路径（可选）
        output_dir: 输出目录
        train_ratio: 训练集比例
        val_ratio: 验证集比例
        test_ratio: 测试集比例
        seed: 随机种子
        report_path: 报告输出路径

    Returns:
        构建报告
    """
    output_dir = Path(output_dir) if output_dir else get_data_path('sft_dataset')
    ensure_dir(output_dir)

    # 加载蒸馏数据
    logger.info(f"Loading distill data from {distill_path}")
    distill_data = read_jsonl(distill_path)
    logger.info(f"Loaded {len(distill_data)} distill items")

    # 转换格式
    sft_items = []
    for i, item in enumerate(distill_data):
        sft_item = convert_to_sft_format(item, source='distill')
        sft_items.append(sft_item)
        print_progress(i + 1, len(distill_data), prefix='Converting distill')

    # 加载官方/开源数据（如果有）
    if official_path and Path(official_path).exists():
        logger.info(f"Loading official data from {official_path}")
        official_data = read_jsonl(official_path)
        logger.info(f"Loaded {len(official_data)} official items")

        for i, item in enumerate(official_data):
            sft_item = convert_to_sft_format(item, source=item.get('source', 'official'))
            sft_items.append(sft_item)
            print_progress(i + 1, len(official_data), prefix='Converting official')

    logger.info(f"Total items before dedup: {len(sft_items)}")

    # 去重
    sft_items = deduplicate_by_code(sft_items)
    logger.info(f"After dedup: {len(sft_items)}")

    # 划分数据集
    train, val, test = stratified_split(
        sft_items,
        train_ratio=train_ratio,
        val_ratio=val_ratio,
        test_ratio=test_ratio,
        seed=seed
    )

    # 保存
    train_path = output_dir / 'train.jsonl'
    val_path = output_dir / 'val.jsonl'
    test_path = output_dir / 'test.jsonl'

    write_jsonl(train_path, train)
    write_jsonl(val_path, val)
    write_jsonl(test_path, test)

    logger.info(f"Saved train: {len(train)}, val: {len(val)}, test: {len(test)}")

    # 统计
    stats = {
        'difficulty': defaultdict(int),
        'source': defaultdict(int)
    }

    for item in sft_items:
        meta = item.get('metadata', {})
        stats['difficulty'][meta.get('difficulty', 'unknown')] += 1
        stats['source'][meta.get('source', 'unknown')] += 1

    # 生成报告
    report = generate_report_summary(
        name='sft_dataset',
        total=len(sft_items),
        passed=len(sft_items),
        details={
            'distill_count': len(distill_data),
            'official_count': len(official_data) if official_path and Path(official_path).exists() else 0,
            'after_dedup': len(sft_items),
            'train_count': len(train),
            'val_count': len(val),
            'test_count': len(test),
            'train_ratio': round(len(train) / len(sft_items) * 100, 2) if sft_items else 0,
            'val_ratio': round(len(val) / len(sft_items) * 100, 2) if sft_items else 0,
            'test_ratio': round(len(test) / len(sft_items) * 100, 2) if sft_items else 0,
            'difficulty_distribution': dict(stats['difficulty']),
            'source_distribution': dict(stats['source']),
            'output_dir': str(output_dir)
        }
    )

    if report_path:
        write_json(report_path, report)
        logger.info(f"Saved report to {report_path}")

    return report


def main():
    parser = argparse.ArgumentParser(description='构建 SFT 数据集')
    parser.add_argument(
        '--distill', '-d',
        type=str,
        default=str(get_data_path('sft_distill/selected.jsonl')),
        help='蒸馏数据文件路径'
    )
    parser.add_argument(
        '--official',
        type=str,
        default=str(get_data_path('sft_official/processed.jsonl')),
        help='官方/开源数据文件路径'
    )
    parser.add_argument(
        '--output-dir', '-o',
        type=str,
        default=str(get_data_path('sft_dataset')),
        help='输出目录'
    )
    parser.add_argument(
        '--train-ratio',
        type=float,
        default=0.9,
        help='训练集比例'
    )
    parser.add_argument(
        '--val-ratio',
        type=float,
        default=0.05,
        help='验证集比例'
    )
    parser.add_argument(
        '--test-ratio',
        type=float,
        default=0.05,
        help='测试集比例'
    )
    parser.add_argument(
        '--seed',
        type=int,
        default=42,
        help='随机种子'
    )
    parser.add_argument(
        '--report',
        type=str,
        default=str(get_reports_path('sft_dataset_report.json')),
        help='报告输出路径'
    )

    args = parser.parse_args()

    report = build_sft_dataset(
        distill_path=args.distill,
        official_path=args.official,
        output_dir=args.output_dir,
        train_ratio=args.train_ratio,
        val_ratio=args.val_ratio,
        test_ratio=args.test_ratio,
        seed=args.seed,
        report_path=args.report
    )

    print(f"\nSFT 数据集构建完成！")
    print(f"  - 总数: {report['total']}")
    print(f"  - 训练集: {report['details']['train_count']} ({report['details']['train_ratio']}%)")
    print(f"  - 验证集: {report['details']['val_count']} ({report['details']['val_ratio']}%)")
    print(f"  - 测试集: {report['details']['test_count']} ({report['details']['test_ratio']}%)")
    print(f"  - 难度分布: {report['details']['difficulty_distribution']}")
    print(f"  - 来源分布: {report['details']['source_distribution']}")
    print(f"  - 输出目录: {report['details']['output_dir']}")


if __name__ == '__main__':
    main()
