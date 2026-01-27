"""
教师模型输出解析脚本

解析教师模型（Claude/GPT）的原始输出，提取 Plan 和 Code。
"""

import re
import argparse
from typing import Optional, Tuple, List, Dict
from datetime import datetime

from common import (
    read_jsonl, write_jsonl, write_json,
    get_data_path, get_reports_path, ensure_dir,
    get_logger, generate_report_summary, print_progress, compute_hash
)

logger = get_logger(__name__)


def parse_plan(raw_output: str) -> Tuple[Optional[dict], List[str]]:
    """
    解析 [PLAN] 块

    Args:
        raw_output: 原始输出文本

    Returns:
        (plan_dict, errors)
    """
    errors = []

    # 尝试提取 [PLAN]...[/PLAN] 块
    plan_match = re.search(r'\[PLAN\](.*?)\[/PLAN\]', raw_output, re.DOTALL | re.IGNORECASE)

    if not plan_match:
        # 尝试其他格式
        plan_match = re.search(r'```plan(.*?)```', raw_output, re.DOTALL | re.IGNORECASE)

    if not plan_match:
        errors.append('plan_block_not_found')
        return None, errors

    plan_text = plan_match.group(1).strip()

    plan = {
        'requirements': '',
        'apis': [],
        'steps': [],
        'raw': plan_text
    }

    # 解析各字段
    for line in plan_text.split('\n'):
        line = line.strip()

        # REQ/Requirements
        if line.upper().startswith('REQ:') or line.upper().startswith('REQUIREMENTS:'):
            plan['requirements'] = re.sub(r'^(REQ|REQUIREMENTS):\s*', '', line, flags=re.IGNORECASE)

        # API
        elif line.upper().startswith('API:') or line.upper().startswith('APIS:'):
            apis_str = re.sub(r'^(API|APIS):\s*', '', line, flags=re.IGNORECASE)
            # 支持逗号或空格分隔
            apis = re.split(r'[,\s]+', apis_str)
            plan['apis'] = [a.strip() for a in apis if a.strip()]

        # STEPS (数字开头的行)
        elif re.match(r'^\d+[.)\-]', line):
            plan['steps'].append(line)

    # 验证必要字段
    if not plan['requirements']:
        errors.append('plan_missing_requirements')
    if not plan['apis']:
        errors.append('plan_missing_apis')
    if not plan['steps']:
        errors.append('plan_missing_steps')

    return plan, errors


def parse_code(raw_output: str) -> Tuple[Optional[str], List[str]]:
    """
    解析代码块

    Args:
        raw_output: 原始输出文本

    Returns:
        (code_string, errors)
    """
    errors = []

    # 尝试提取 ```javascript...``` 或 ```js...```
    code_match = re.search(
        r'```(?:javascript|js|JavaScript|JS)?\s*\n?(.*?)```',
        raw_output,
        re.DOTALL
    )

    if code_match:
        code = code_match.group(1).strip()
        if code:
            return code, errors

    # 备选：尝试提取 [/PLAN] 之后的代码
    plan_end = re.search(r'\[/PLAN\]', raw_output, re.IGNORECASE)
    if plan_end:
        after_plan = raw_output[plan_end.end():].strip()
        # 检查是否包含 Phaser 相关代码
        if 'Phaser' in after_plan or 'new Phaser.Game' in after_plan:
            # 移除可能的围栏
            code = re.sub(r'^```.*\n?', '', after_plan)
            code = re.sub(r'```$', '', code).strip()
            if code:
                return code, errors

    # 备选：查找包含 Phaser 的代码块
    phaser_match = re.search(
        r'((?:const|let|var|function|class).*?Phaser.*)',
        raw_output,
        re.DOTALL
    )
    if phaser_match:
        code = phaser_match.group(1).strip()
        if len(code) > 100:
            errors.append('code_extracted_fallback')
            return code, errors

    errors.append('code_not_found')
    return None, errors


def parse_teacher_output(raw_output: str) -> dict:
    """
    解析教师模型的完整输出

    Args:
        raw_output: 原始输出文本

    Returns:
        解析结果字典
    """
    result = {
        'plan': None,
        'code': None,
        'parse_errors': [],
        'parse_warnings': []
    }

    # 解析 Plan
    plan, plan_errors = parse_plan(raw_output)
    result['plan'] = plan
    result['parse_errors'].extend(plan_errors)

    # 解析 Code
    code, code_errors = parse_code(raw_output)
    result['code'] = code

    # 区分 warning 和 error
    for err in code_errors:
        if err == 'code_extracted_fallback':
            result['parse_warnings'].append(err)
        else:
            result['parse_errors'].append(err)

    return result


def validate_code(code: str) -> Tuple[bool, List[str]]:
    """
    基础代码验证（不调用 validator）

    Args:
        code: 代码字符串

    Returns:
        (is_valid, issues)
    """
    issues = []

    if not code or len(code) < 50:
        issues.append('code_too_short')
        return False, issues

    # 检查基本结构
    if 'Phaser' not in code:
        issues.append('missing_phaser_reference')

    if 'new Phaser.Game' not in code and 'Phaser.Game' not in code:
        issues.append('missing_game_instantiation')

    # 检查生命周期方法
    has_create = bool(re.search(r'\bfunction\s+create\s*\(|create\s*:\s*function|\bcreate\s*\(\s*\)', code))
    has_preload = bool(re.search(r'\bfunction\s+preload\s*\(|preload\s*:\s*function|\bpreload\s*\(\s*\)', code))

    if not has_create:
        issues.append('missing_create_lifecycle')
    if not has_preload:
        issues.append('missing_preload_lifecycle')  # 这是 warning 而非 error

    return len([i for i in issues if 'missing_preload' not in i]) == 0, issues


def process_raw_outputs(
    raw_outputs_path: str,
    output_path: str,
    codes_dir: str = None,
    report_path: str = None
) -> dict:
    """
    处理所有原始输出，生成候选数据

    Args:
        raw_outputs_path: 原始输出文件路径
        output_path: 候选数据输出路径
        codes_dir: 代码文件输出目录
        report_path: 报告输出路径

    Returns:
        处理报告
    """
    logger.info(f"Loading raw outputs from {raw_outputs_path}")
    raw_outputs = read_jsonl(raw_outputs_path)
    logger.info(f"Loaded {len(raw_outputs)} raw outputs")

    candidates = []
    stats = {
        'total': len(raw_outputs),
        'parse_success': 0,
        'plan_parsed': 0,
        'code_parsed': 0,
        'validation_passed': 0,
        'errors': {}
    }

    if codes_dir:
        ensure_dir(codes_dir)

    for i, item in enumerate(raw_outputs):
        raw_output = item.get('raw_output', '') or item.get('output', '')

        # 解析输出
        parsed = parse_teacher_output(raw_output)

        # 统计
        if parsed['plan']:
            stats['plan_parsed'] += 1
        if parsed['code']:
            stats['code_parsed'] += 1

        for err in parsed['parse_errors']:
            stats['errors'][err] = stats['errors'].get(err, 0) + 1

        # 验证代码
        code_valid = False
        if parsed['code']:
            code_valid, validation_issues = validate_code(parsed['code'])
            parsed['validation_issues'] = validation_issues
            if code_valid:
                stats['validation_passed'] += 1

        # 判断解析是否成功
        parse_success = parsed['plan'] is not None and parsed['code'] is not None
        if parse_success:
            stats['parse_success'] += 1

        # 构建候选数据
        candidate = {
            'id': item.get('id', f'distill_{i:06d}'),
            'prompt_id': item.get('prompt_id', ''),
            'version': item.get('version', 1),
            'prompt': item.get('prompt_meta', item.get('prompt', {})),
            'teacher_model': item.get('teacher_model', 'unknown'),
            'plan': parsed['plan'],
            'code': parsed['code'],
            'raw_output': raw_output,
            'parse_errors': parsed['parse_errors'],
            'parse_warnings': parsed.get('parse_warnings', []),
            'validation_issues': parsed.get('validation_issues', []),
            'parse_success': parse_success,
            'code_valid': code_valid,
            'api_context_injected': item.get('api_context_injected', []),
            'timestamp': item.get('timestamp', datetime.now().isoformat())
        }

        candidates.append(candidate)

        # 保存代码文件（用于后续 validator）
        if codes_dir and parsed['code']:
            code_hash = compute_hash(parsed['code'])
            code_path = f"{codes_dir}/{code_hash}.js"
            with open(code_path, 'w', encoding='utf-8') as f:
                f.write(parsed['code'])
            candidate['code_hash'] = code_hash
            candidate['code_path'] = code_path

        print_progress(i + 1, len(raw_outputs), prefix='Parsing outputs')

    # 保存候选数据
    write_jsonl(output_path, candidates)
    logger.info(f"Saved {len(candidates)} candidates to {output_path}")

    # 生成报告
    report = generate_report_summary(
        name='parse_teacher_outputs',
        total=stats['total'],
        passed=stats['parse_success'],
        details={
            'plan_parsed': stats['plan_parsed'],
            'code_parsed': stats['code_parsed'],
            'validation_passed': stats['validation_passed'],
            'error_distribution': stats['errors'],
            'parse_rate': round(stats['parse_success'] / stats['total'] * 100, 2) if stats['total'] > 0 else 0,
            'output_path': str(output_path)
        }
    )

    if report_path:
        write_json(report_path, report)
        logger.info(f"Saved report to {report_path}")

    return report


def main():
    parser = argparse.ArgumentParser(description='解析教师模型输出')
    parser.add_argument(
        '--input', '-i',
        type=str,
        default=str(get_data_path('sft_distill/raw_outputs.jsonl')),
        help='原始输出文件路径'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default=str(get_data_path('sft_distill/candidates.jsonl')),
        help='候选数据输出路径'
    )
    parser.add_argument(
        '--codes-dir',
        type=str,
        default=str(get_data_path('sft_distill/codes')),
        help='代码文件输出目录'
    )
    parser.add_argument(
        '--report',
        type=str,
        default=str(get_reports_path('parse_report.json')),
        help='报告输出路径'
    )

    args = parser.parse_args()

    report = process_raw_outputs(
        raw_outputs_path=args.input,
        output_path=args.output,
        codes_dir=args.codes_dir,
        report_path=args.report
    )

    print(f"\n解析完成！")
    print(f"  - 总数: {report['total']}")
    print(f"  - 解析成功: {report['passed']} ({report['pass_rate']}%)")
    print(f"  - Plan 解析成功: {report['details']['plan_parsed']}")
    print(f"  - Code 解析成功: {report['details']['code_parsed']}")
    print(f"  - 验证通过: {report['details']['validation_passed']}")


if __name__ == '__main__':
    main()
