"""
L5: 多样性与质量综合筛选脚本

从验证通过的候选数据中：
1. 按 prompt_id 分组
2. 计算质量评分
3. 多样性筛选（代码相似度去重）
4. 每个 prompt 选择最佳 1-2 个版本
"""

import difflib
import argparse
from collections import defaultdict
from typing import List, Dict

from common import (
    read_jsonl, write_jsonl, write_json,
    get_data_path, get_reports_path,
    get_logger, generate_report_summary, print_progress,
    normalize_code
)

logger = get_logger(__name__)


def calculate_quality_score(candidate: dict) -> float:
    """
    计算候选数据的质量评分 (0-1)

    评分维度：
    - L1 基础分 (0.2)
    - L4 结构与一致性 (0.3)
    """
    score = 0.0

    # L1: 基础分
    if candidate.get('l1_passed'):
        score += 0.2
        # ESLint warning 轻扣
        validator_result = candidate.get('validator_result', {})
        warnings = len(validator_result.get('warnings', []))
        score -= min(0.05, warnings * 0.01)

    # L4: 结构与一致性
    if candidate.get('l4_passed'):
        score += 0.2

        # 一致性检查
        plan = candidate.get('plan', {})
        if plan:
            plan_apis = plan.get('apis', [])
            if plan_apis:
                validator_result = candidate.get('validator_result', {})
                api_usage = validator_result.get('api_usage', {})
                code_apis = set()
                for hit in api_usage.get('hits', []):
                    if isinstance(hit, dict):
                        code_apis.add(hit.get('symbol_id', '').lower())
                    else:
                        code_apis.add(str(hit).lower())

                # 计算一致性
                matched = 0
                for api in plan_apis:
                    api_lower = api.lower()
                    for code_api in code_apis:
                        if api_lower in code_api:
                            matched += 1
                            break

                consistency = matched / len(plan_apis)
                score += 0.1 * consistency

    return min(1.0, max(0.0, score))


def code_similarity(code1: str, code2: str) -> float:
    """
    计算两段代码的相似度 (0-1)

    使用规范化后的代码进行比较
    """
    if not code1 or not code2:
        return 0.0

    code1_norm = normalize_code(code1)
    code2_norm = normalize_code(code2)

    return difflib.SequenceMatcher(None, code1_norm, code2_norm).ratio()


def select_diverse_candidates(
    candidates: List[dict],
    max_per_prompt: int = 2,
    similarity_threshold: float = 0.85
) -> List[dict]:
    """
    从同一 Prompt 的多个候选中选择最多样化的

    Args:
        candidates: 同一 prompt 的候选列表
        max_per_prompt: 每个 prompt 最多保留的数量
        similarity_threshold: 相似度阈值，高于此值视为重复

    Returns:
        选中的候选列表
    """
    if len(candidates) <= 1:
        return candidates

    # 按质量分数排序
    sorted_candidates = sorted(
        candidates,
        key=lambda x: x.get('quality_score', 0),
        reverse=True
    )

    selected = [sorted_candidates[0]]  # 先选最高分

    for candidate in sorted_candidates[1:]:
        if len(selected) >= max_per_prompt:
            break

        # 检查与已选的相似度
        code = candidate.get('code', '')
        is_diverse = True

        for sel in selected:
            sel_code = sel.get('code', '')
            similarity = code_similarity(code, sel_code)
            if similarity >= similarity_threshold:
                is_diverse = False
                break

        if is_diverse:
            selected.append(candidate)

    return selected


def run_selection(
    validated_path: str,
    output_path: str,
    max_per_prompt: int = 2,
    similarity_threshold: float = 0.85,
    require_all_passed: bool = True,
    report_path: str = None
) -> dict:
    """
    运行 L5 多样性筛选

    Args:
        validated_path: L1/L4 验证后的数据文件
        output_path: 输出文件路径
        max_per_prompt: 每个 prompt 最多保留的数量
        similarity_threshold: 相似度阈值
        require_all_passed: 是否要求 L1/L4 全部通过
        report_path: 报告输出路径

    Returns:
        筛选报告
    """
    logger.info(f"Loading validated candidates from {validated_path}")
    candidates = read_jsonl(validated_path)
    logger.info(f"Loaded {len(candidates)} candidates")

    # 过滤：只保留通过验证的
    if require_all_passed:
        filtered = [
            c for c in candidates
            if c.get('l1_passed') and c.get('l4_passed')
        ]
    else:
        # 至少通过 L1 和 L4
        filtered = [
            c for c in candidates
            if c.get('l1_passed') and c.get('l4_passed')
        ]

    logger.info(f"After filtering: {len(filtered)} candidates")

    # 计算质量分数
    for c in filtered:
        c['quality_score'] = calculate_quality_score(c)

    # 按 prompt_id 分组
    grouped = defaultdict(list)
    for c in filtered:
        prompt_id = c.get('prompt_id', 'unknown')
        grouped[prompt_id].append(c)

    # 多样性筛选
    selected = []
    stats = {
        'total_prompts': len(grouped),
        'selected_per_prompt': {},
        'difficulty_distribution': defaultdict(int),
        'quality_score_distribution': {
            '0.0-0.3': 0,
            '0.3-0.5': 0,
            '0.5-0.7': 0,
            '0.7-0.9': 0,
            '0.9-1.0': 0
        }
    }

    for i, (prompt_id, prompt_candidates) in enumerate(grouped.items()):
        diverse = select_diverse_candidates(
            prompt_candidates,
            max_per_prompt=max_per_prompt,
            similarity_threshold=similarity_threshold
        )

        for c in diverse:
            c['selected'] = True
            selected.append(c)

            # 统计难度分布
            difficulty = c.get('prompt', {}).get('difficulty', 'unknown')
            stats['difficulty_distribution'][difficulty] += 1

            # 统计质量分数分布
            score = c.get('quality_score', 0)
            if score < 0.3:
                stats['quality_score_distribution']['0.0-0.3'] += 1
            elif score < 0.5:
                stats['quality_score_distribution']['0.3-0.5'] += 1
            elif score < 0.7:
                stats['quality_score_distribution']['0.5-0.7'] += 1
            elif score < 0.9:
                stats['quality_score_distribution']['0.7-0.9'] += 1
            else:
                stats['quality_score_distribution']['0.9-1.0'] += 1

        stats['selected_per_prompt'][prompt_id] = len(diverse)

        print_progress(i + 1, len(grouped), prefix='Selecting')

    # 保存结果
    write_jsonl(output_path, selected)
    logger.info(f"Saved {len(selected)} selected candidates to {output_path}")

    # 计算平均选中数
    avg_selected = sum(stats['selected_per_prompt'].values()) / len(grouped) if grouped else 0

    # 生成报告
    report = generate_report_summary(
        name='selection',
        total=len(filtered),
        passed=len(selected),
        details={
            'total_candidates': len(candidates),
            'after_filter': len(filtered),
            'total_prompts': stats['total_prompts'],
            'avg_selected_per_prompt': round(avg_selected, 2),
            'max_per_prompt': max_per_prompt,
            'similarity_threshold': similarity_threshold,
            'difficulty_distribution': dict(stats['difficulty_distribution']),
            'quality_score_distribution': stats['quality_score_distribution'],
            'output_path': str(output_path)
        }
    )

    if report_path:
        write_json(report_path, report)
        logger.info(f"Saved report to {report_path}")

    return report


def main():
    parser = argparse.ArgumentParser(description='L5: 多样性与质量综合筛选')
    parser.add_argument(
        '--input', '-i',
        type=str,
        default=str(get_data_path('sft_distill/validated.jsonl')),
        help='验证后的数据文件路径'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default=str(get_data_path('sft_distill/selected.jsonl')),
        help='输出文件路径'
    )
    parser.add_argument(
        '--max-per-prompt',
        type=int,
        default=2,
        help='每个 prompt 最多保留的数量'
    )
    parser.add_argument(
        '--similarity-threshold',
        type=float,
        default=0.85,
        help='相似度阈值'
    )
    parser.add_argument(
        '--allow-partial',
        action='store_true',
        help='允许部分通过的候选（只需 L1+L4）'
    )
    parser.add_argument(
        '--report',
        type=str,
        default=str(get_reports_path('selection_report.json')),
        help='报告输出路径'
    )

    args = parser.parse_args()

    report = run_selection(
        validated_path=args.input,
        output_path=args.output,
        max_per_prompt=args.max_per_prompt,
        similarity_threshold=args.similarity_threshold,
        require_all_passed=not args.allow_partial,
        report_path=args.report
    )

    print(f"\n筛选完成！")
    print(f"  - 验证后候选: {report['details']['after_filter']}")
    print(f"  - 最终选中: {report['passed']}")
    print(f"  - Prompt 数: {report['details']['total_prompts']}")
    print(f"  - 平均每 Prompt 选中: {report['details']['avg_selected_per_prompt']}")
    print(f"  - 难度分布: {report['details']['difficulty_distribution']}")


if __name__ == '__main__':
    main()
