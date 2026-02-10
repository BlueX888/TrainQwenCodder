"""
验证过滤脚本 (L1/L4)

调用 stage0/validator 对候选数据进行两层质量过滤：
- L1: 语法与基础规范检查
- L4: 功能匹配度验证
"""

import subprocess
import json
import argparse
from pathlib import Path
from typing import Optional, Tuple, List
from concurrent.futures import ThreadPoolExecutor, as_completed

from common import (
    read_jsonl, write_jsonl, write_json,
    get_data_path, get_reports_path, get_stage0_path, ensure_dir,
    get_logger, generate_report_summary, print_progress,
    compute_hash, JsonlCache
)

logger = get_logger(__name__)

# Validator CLI 路径
VALIDATOR_CLI = get_stage0_path('validator/src/cli.js')
API_INDEX_PATH = get_stage0_path('data/api_index/phaser_api.jsonl')


def call_validator(
    code_path: str,
    api_index_path: str = None
) -> dict:
    """
    调用 stage0 validator CLI

    Args:
        code_path: 代码文件路径
        api_index_path: API 索引路径
    Returns:
        Validator 输出结果
    """
    api_index_path = api_index_path or str(API_INDEX_PATH)

    cmd = [
        'node', str(VALIDATOR_CLI),
        '--code-file', code_path,
        '--api-index', api_index_path
    ]

    # Stage1 不做运行时验证，固定跳过 runtime
    cmd.append('--skip-runtime')

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30  # 进程级超时
        )

        if result.stdout.strip():
            return json.loads(result.stdout)
        else:
            return {
                'error': result.stderr or 'No output from validator',
                'parse_ok': False,
                'lint_ok': False,
                'api_ok': False,
                'runtime_ok': False
            }

    except subprocess.TimeoutExpired:
        return {
            'error': 'Validator process timeout',
            'parse_ok': False,
            'lint_ok': False,
            'api_ok': False,
            'runtime_ok': False
        }
    except json.JSONDecodeError as e:
        return {
            'error': f'JSON decode error: {str(e)}',
            'parse_ok': False,
            'lint_ok': False,
            'api_ok': False,
            'runtime_ok': False
        }
    except Exception as e:
        return {
            'error': str(e),
            'parse_ok': False,
            'lint_ok': False,
            'api_ok': False,
            'runtime_ok': False
        }


def check_l1(validator_result: dict, code: str) -> Tuple[bool, List[str]]:
    """
    L1: 语法与基础规范检查

    - parse_ok: Babel 可解析
    - lint_ok: ESLint 通过
    - 无危险用法
    - 代码非空（>100字符）
    """
    issues = []

    # 代码长度检查
    if not code or len(code) < 100:
        issues.append('l1_code_too_short')
        return False, issues

    # 语法解析
    if not validator_result.get('parse_ok', False):
        issues.append('l1_parse_failed')

    # ESLint
    if not validator_result.get('lint_ok', False):
        issues.append('l1_lint_failed')
        # 收集具体错误
        errors = validator_result.get('errors', [])
        for err in errors[:3]:  # 最多记录3个
            if isinstance(err, dict):
                issues.append(f"l1_lint_error:{err.get('message', 'unknown')[:50]}")

    # 危险用法
    banned = validator_result.get('banned', [])
    if banned:
        issues.append(f'l1_banned_usage:{",".join(banned[:3])}')

    passed = (
        validator_result.get('parse_ok', False) and
        validator_result.get('lint_ok', False) and
        len(banned) == 0
    )

    return passed, issues


def check_l4(validator_result: dict, candidate: dict) -> Tuple[bool, List[str]]:
    """
    L4: 功能匹配度验证

    - 结构完整性：has_new_phaser_game + has_scene_in_config
    - 生命周期完整：has_create
    - plan 存在
    - plan-code 一致性：plan.apis 在代码中命中率 ≥ 60%
    """
    issues = []

    signals = validator_result.get('signals', {})
    plan = candidate.get('plan')
    prompt = candidate.get('prompt', {})
    difficulty = prompt.get('difficulty', 'medium')

    # 结构完整性
    has_game = signals.get('has_new_phaser_game', False)
    has_scene = signals.get('has_scene_in_config', False)
    has_create = signals.get('has_create', False)
    has_preload = signals.get('has_preload', False)

    if not has_game:
        issues.append('l4_missing_game')
    if not has_create:
        issues.append('l4_missing_create')

    # 按难度调整要求
    structure_ok = has_game and has_create
    if difficulty == 'hard' and not has_preload:
        issues.append('l4_hard_missing_preload')

    # Plan 存在
    if not plan:
        issues.append('l4_missing_plan')
        return False, issues

    # Plan-Code 一致性
    plan_apis = plan.get('apis', [])
    if plan_apis:
        api_usage = validator_result.get('api_usage', {})
        code_apis = set()
        for hit in api_usage.get('hits', []):
            if isinstance(hit, dict):
                code_apis.add(hit.get('symbol_id', ''))
            else:
                code_apis.add(str(hit))

        # 模糊匹配
        matched = 0
        for api in plan_apis:
            api_lower = api.lower()
            for code_api in code_apis:
                code_api_lower = code_api.lower()
                if api_lower in code_api_lower or code_api_lower.endswith(f'#{api_lower}'):
                    matched += 1
                    break

        consistency = matched / len(plan_apis) if plan_apis else 1.0
        if consistency < 0.6:
            issues.append(f'l4_low_plan_code_consistency:{consistency:.2f}')

    passed = structure_ok and plan is not None
    # 一致性低是 warning，不直接导致失败
    if any('l4_missing' in i or 'l4_hard_missing' in i for i in issues):
        passed = False

    return passed, issues


def validate_candidate(
    candidate: dict,
    codes_dir: str,
    cache: Optional[JsonlCache] = None
) -> dict:
    """
    验证单个候选数据

    Returns:
        包含验证结果的候选数据
    """
    code = candidate.get('code', '')
    code_hash = compute_hash(code) if code else ''

    cache_key = compute_hash(
        json.dumps(
            {
                "code_hash": code_hash,
            },
            ensure_ascii=False,
            sort_keys=True,
        )
    )

    # 检查缓存
    if cache and cache.has(cache_key):
        cached = cache.get(cache_key)
        candidate['validator_result'] = cached.get('validator_result', {})
        candidate['l1_passed'] = cached.get('l1_passed', False)
        candidate['l4_passed'] = cached.get('l4_passed', False)
        candidate['filter_issues'] = cached.get('filter_issues', [])
        candidate['from_cache'] = True
        return candidate

    # 写入临时代码文件
    code_path = Path(codes_dir) / f'{code_hash}.js'
    if not code_path.exists():
        ensure_dir(codes_dir)
        code_path.write_text(code, encoding='utf-8')

    # 调用 validator
    validator_result = call_validator(
        code_path=str(code_path)
    )

    candidate['validator_result'] = validator_result
    candidate['filter_issues'] = []

    # L1 检查
    l1_passed, l1_issues = check_l1(validator_result, code)
    candidate['l1_passed'] = l1_passed
    candidate['filter_issues'].extend(l1_issues)

    # L4 检查
    l4_passed, l4_issues = check_l4(validator_result, candidate)
    candidate['l4_passed'] = l4_passed
    candidate['filter_issues'].extend(l4_issues)

    # 缓存结果
    if cache:
        cache.set(cache_key, {
            'code_hash': code_hash,
            'validator_result': validator_result,
            'l1_passed': l1_passed,
            'l4_passed': l4_passed,
            'filter_issues': candidate['filter_issues']
        })

    return candidate


def run_filter_pipeline(
    candidates_path: str,
    output_path: str,
    codes_dir: str = None,
    cache_path: str = None,
    report_path: str = None,
    max_workers: int = 4
) -> dict:
    """
    运行完整的 L1/L4 过滤管线

    Args:
        candidates_path: 候选数据文件路径
        output_path: 输出文件路径
        codes_dir: 代码文件目录
        cache_path: 缓存文件路径
        report_path: 报告输出路径
        max_workers: 并行 worker 数量

    Returns:
        过滤报告
    """
    logger.info(f"Loading candidates from {candidates_path}")
    candidates = read_jsonl(candidates_path)
    logger.info(f"Loaded {len(candidates)} candidates")

    # 初始化
    codes_dir = codes_dir or str(get_data_path('sft_distill/codes'))
    ensure_dir(codes_dir)

    cache = JsonlCache(cache_path, key_field='cache_key') if cache_path else None
    if cache:
        logger.info(f"Loaded {len(cache)} cached results")

    # 统计
    stats = {
        'total': len(candidates),
        'l1_passed': 0,
        'l4_passed': 0,
        'all_passed': 0,
        'issues': {}
    }

    validated = []

    # 并行处理
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(
                validate_candidate,
                candidate=candidate,
                codes_dir=codes_dir,
                cache=cache
            ): i
            for i, candidate in enumerate(candidates)
        }

        for future in as_completed(futures):
            validated_candidate = future.result()
            validated.append(validated_candidate)

            # 统计
            if validated_candidate.get('l1_passed'):
                stats['l1_passed'] += 1
            if validated_candidate.get('l4_passed'):
                stats['l4_passed'] += 1

            all_passed = (
                validated_candidate.get('l1_passed') and
                validated_candidate.get('l4_passed')
            )
            if all_passed:
                stats['all_passed'] += 1

            for issue in validated_candidate.get('filter_issues', []):
                issue_key = issue.split(':')[0]  # 取主要类型
                stats['issues'][issue_key] = stats['issues'].get(issue_key, 0) + 1

            print_progress(len(validated), len(candidates), prefix='Validating')

    # 保存结果
    write_jsonl(output_path, validated)
    logger.info(f"Saved {len(validated)} validated candidates to {output_path}")

    # 生成报告
    report = generate_report_summary(
        name='validator_filter',
        total=stats['total'],
        passed=stats['all_passed'],
        details={
            'l1_passed': stats['l1_passed'],
            'l1_rate': round(stats['l1_passed'] / stats['total'] * 100, 2) if stats['total'] > 0 else 0,
            'l4_passed': stats['l4_passed'],
            'l4_rate': round(stats['l4_passed'] / stats['total'] * 100, 2) if stats['total'] > 0 else 0,
            'issue_distribution': stats['issues'],
            'output_path': str(output_path)
        }
    )

    if report_path:
        write_json(report_path, report)
        logger.info(f"Saved report to {report_path}")

    return report


def main():
    parser = argparse.ArgumentParser(description='运行 L1/L4 验证过滤')
    parser.add_argument(
        '--input', '-i',
        type=str,
        default=str(get_data_path('sft_distill/candidates.jsonl')),
        help='候选数据文件路径'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default=str(get_data_path('sft_distill/validated.jsonl')),
        help='输出文件路径'
    )
    parser.add_argument(
        '--codes-dir',
        type=str,
        default=str(get_data_path('sft_distill/codes')),
        help='代码文件目录'
    )
    parser.add_argument(
        '--cache',
        type=str,
        default=str(get_data_path('sft_distill/validator_cache.jsonl')),
        help='缓存文件路径'
    )
    parser.add_argument(
        '--report',
        type=str,
        default=str(get_reports_path('filter_report.json')),
        help='报告输出路径'
    )
    parser.add_argument(
        '--workers',
        type=int,
        default=4,
        help='并行 worker 数量'
    )

    args = parser.parse_args()

    report = run_filter_pipeline(
        candidates_path=args.input,
        output_path=args.output,
        codes_dir=args.codes_dir,
        cache_path=args.cache,
        report_path=args.report,
        max_workers=args.workers
    )

    print(f"\n过滤完成！")
    print(f"  - 总数: {report['total']}")
    print(f"  - L1 通过: {report['details']['l1_passed']} ({report['details']['l1_rate']}%)")
    print(f"  - L4 通过: {report['details']['l4_passed']} ({report['details']['l4_rate']}%)")
    print(f"  - 全部通过: {report['passed']} ({report['pass_rate']}%)")


if __name__ == '__main__':
    main()
