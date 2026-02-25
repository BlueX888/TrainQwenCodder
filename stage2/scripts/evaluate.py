#!/usr/bin/env python3
"""
固定评估集上运行已训练模型的评估脚本。

工作流:
1. 加载评估 prompts（parquet 或 prompt_seeds JSONL）
2. 用 HuggingFace Transformers 加载模型，生成响应
3. 运行 validator + reward 计算
4. 输出分层报告（按难度/模块分组）

Usage:
    python evaluate.py \
        --model path/to/grpo_checkpoint \
        --eval-data stage2/data/grpo/eval.parquet \
        --out-report stage2/data/grpo/reports/eval_report.json \
        --passes 1,8 \
        --temperature 0.2 \
        --workers 8
"""

import argparse
import json
import random
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

sys.path.insert(0, str(Path(__file__).parent))

from common import (
    ensure_dir, write_json, write_jsonl, get_data_path, get_logger,
    read_jsonl, print_progress
)
from parse_output import parse_model_output
from validator_pool import ValidatorPool
from reward_phaser import (
    compute_r_plan, compute_r_code, compute_hacking_penalty,
    PLAN_WEIGHT, CODE_WEIGHT
)

logger = get_logger(__name__)


def load_eval_prompts(eval_path: str) -> List[dict]:
    """从 parquet 或 JSONL 加载评估 prompts"""
    path = Path(eval_path)

    if path.suffix == '.parquet':
        try:
            import pandas as pd
            df = pd.read_parquet(path)
            records = df.to_dict(orient='records')
            logger.info(f"Loaded {len(records)} eval prompts from parquet")
            return records
        except ImportError:
            logger.error("pandas is required to read parquet files")
            return []
    elif path.suffix == '.jsonl':
        records = read_jsonl(path)
        logger.info(f"Loaded {len(records)} eval prompts from JSONL")
        return records
    else:
        logger.error(f"Unsupported file format: {path.suffix}")
        return []


def build_chat_messages(record: dict) -> List[dict]:
    """从 VeRL 记录构建 chat messages"""
    prompt = record.get("prompt", [])
    if isinstance(prompt, list) and len(prompt) > 0:
        return prompt
    # 回退：从 ground_truth 构建
    gt = record.get("reward_model", {}).get("ground_truth", {})
    if isinstance(gt, str):
        gt = json.loads(gt)
    # 简单回退
    return [{"role": "user", "content": gt.get("task", "")}]


def generate_responses(
    model,
    tokenizer,
    messages_list: List[List[dict]],
    n_samples: int = 1,
    temperature: float = 0.2,
    top_p: float = 0.9,
    max_new_tokens: int = 2048,
    batch_size: int = 4,
) -> List[List[str]]:
    """为每组 messages 生成 n_samples 个响应"""
    import torch

    all_responses = []
    total = len(messages_list)

    for idx, messages in enumerate(messages_list):
        responses = []

        # 应用 chat template
        prompt_text = tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )

        for sample_idx in range(n_samples):
            enc = tokenizer(prompt_text, return_tensors="pt").to(model.device)
            with torch.no_grad():
                gen = model.generate(
                    **enc,
                    do_sample=True if temperature > 0 else False,
                    temperature=max(temperature, 1e-7),
                    top_p=top_p,
                    max_new_tokens=max_new_tokens,
                    pad_token_id=tokenizer.eos_token_id,
                )
            prompt_len = enc.input_ids.shape[1]
            text = tokenizer.decode(gen[0][prompt_len:], skip_special_tokens=True)
            responses.append(text)

        all_responses.append(responses)

        if (idx + 1) % 10 == 0 or idx + 1 == total:
            print_progress(idx + 1, total, prefix="Generating")

    return all_responses


def evaluate_single_prompt(
    responses: List[str],
    ground_truth: dict,
    validator_pool: ValidatorPool,
) -> List[dict]:
    """评估单个 prompt 的所有响应"""
    results = []
    must_use_apis = ground_truth.get("must_use_apis", [])

    for resp in responses:
        parsed = parse_model_output(resp)
        if not parsed.has_code:
            results.append({
                "pass": False, "reward": 0.0, "reason": "no_code",
                "has_plan": parsed.has_plan, "has_code": False,
            })
            continue

        vr = validator_pool.validate_single(parsed.code, must_use_apis)
        r_plan, plan_detail = compute_r_plan(parsed.plan, parsed.code, vr, ground_truth)
        r_code, code_detail = compute_r_code(parsed.code, vr, ground_truth)
        penalty, penalty_detail = compute_hacking_penalty(
            parsed.code, parsed.plan, vr, ground_truth
        )

        reward = max(0.0, PLAN_WEIGHT * r_plan + CODE_WEIGHT * r_code - penalty)

        # 判断是否"通过"
        passed = (
            vr.parse_ok and
            vr.signals.get("has_new_phaser_game", False) and
            vr.signals.get("has_create", False)
        )

        results.append({
            "pass": passed,
            "reward": round(reward, 4),
            "r_plan": round(r_plan, 4),
            "r_code": round(r_code, 4),
            "penalty": round(penalty, 4),
            "parse_ok": vr.parse_ok,
            "lint_ok": vr.lint_ok,
            "api_ok": vr.api_ok,
            "runtime_ok": vr.runtime_ok,
            "has_plan": parsed.has_plan,
            "has_code": parsed.has_code,
            "plan_detail": plan_detail,
            "code_detail": code_detail,
            "must_use_hits": len(vr.api_usage.get("must_use_hits", [])),
            "must_use_misses": len(vr.api_usage.get("must_use_misses", [])),
        })

    return results


def compute_pass_at_k(results_per_prompt: List[List[dict]], k: int) -> float:
    """计算 Pass@k 指标"""
    n_prompts = len(results_per_prompt)
    passed = 0
    for prompt_results in results_per_prompt:
        top_k = prompt_results[:k]
        if any(r.get("pass", False) for r in top_k):
            passed += 1
    return passed / n_prompts if n_prompts > 0 else 0.0


def compute_metrics(
    all_results: List[List[dict]],
    all_ground_truths: List[dict],
    pass_k_values: List[int],
) -> dict:
    """计算综合评估指标"""
    metrics = {}

    # 全局 Pass@k
    for k in pass_k_values:
        metrics[f"pass@{k}"] = round(compute_pass_at_k(all_results, k) * 100, 2)

    # 全局指标（基于所有响应）
    all_flat = [r for prompt_results in all_results for r in prompt_results]
    if all_flat:
        rewards = [r["reward"] for r in all_flat]
        metrics["reward_mean"] = round(sum(rewards) / len(rewards), 4)
        metrics["reward_std"] = round(
            (sum((x - metrics["reward_mean"])**2 for x in rewards) / len(rewards))**0.5, 4
        )
        metrics["parse_rate"] = round(
            sum(1 for r in all_flat if r.get("parse_ok", False)) / len(all_flat) * 100, 2
        )
        metrics["lint_rate"] = round(
            sum(1 for r in all_flat if r.get("lint_ok", False)) / len(all_flat) * 100, 2
        )
        metrics["api_rate"] = round(
            sum(1 for r in all_flat if r.get("api_ok", False)) / len(all_flat) * 100, 2
        )
        metrics["has_plan_rate"] = round(
            sum(1 for r in all_flat if r.get("has_plan", False)) / len(all_flat) * 100, 2
        )
        metrics["has_code_rate"] = round(
            sum(1 for r in all_flat if r.get("has_code", False)) / len(all_flat) * 100, 2
        )

    # 按难度分层
    by_difficulty = defaultdict(lambda: {"results": [], "gts": []})
    for results, gt in zip(all_results, all_ground_truths):
        diff = gt.get("difficulty", "medium")
        by_difficulty[diff]["results"].append(results)
        by_difficulty[diff]["gts"].append(gt)

    metrics["by_difficulty"] = {}
    for diff, data in sorted(by_difficulty.items()):
        diff_metrics = {}
        for k in pass_k_values:
            diff_metrics[f"pass@{k}"] = round(
                compute_pass_at_k(data["results"], k) * 100, 2
            )
        flat = [r for pr in data["results"] for r in pr]
        if flat:
            diff_metrics["count"] = len(data["results"])
            diff_metrics["reward_mean"] = round(
                sum(r["reward"] for r in flat) / len(flat), 4
            )
        metrics["by_difficulty"][diff] = diff_metrics

    return metrics


def main():
    parser = argparse.ArgumentParser(description='GRPO 模型评估')
    parser.add_argument('--model', required=True, help='模型路径')
    parser.add_argument('--eval-data',
                        default=str(get_data_path('grpo/eval.parquet')))
    parser.add_argument('--out-report',
                        default=str(get_data_path('grpo/reports/eval_report.json')))
    parser.add_argument('--out-details',
                        default=str(get_data_path('grpo/reports/eval_details.jsonl')))
    parser.add_argument('--passes', default='1,8',
                        help='逗号分隔的 pass@k 值')
    parser.add_argument('--temperature', type=float, default=0.2)
    parser.add_argument('--top-p', type=float, default=0.9)
    parser.add_argument('--max-new-tokens', type=int, default=2048)
    parser.add_argument('--workers', type=int, default=8)
    parser.add_argument('--skip-runtime', action='store_true', default=False)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--max-eval', type=int, default=0,
                        help='最大评估数量（0=全部）')
    args = parser.parse_args()

    import torch

    pass_k_values = [int(k.strip()) for k in args.passes.split(',')]
    max_samples = max(pass_k_values)

    random.seed(args.seed)
    torch.manual_seed(args.seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(args.seed)

    # 加载评估 prompts
    eval_records = load_eval_prompts(args.eval_data)
    if args.max_eval > 0:
        eval_records = eval_records[:args.max_eval]

    logger.info(f"Evaluating {len(eval_records)} prompts, pass@{pass_k_values}, "
                f"temp={args.temperature}, max_samples={max_samples}")

    # 加载模型
    logger.info(f"Loading model from {args.model}")
    tokenizer = AutoTokenizer.from_pretrained(args.model, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        args.model,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map="auto" if torch.cuda.is_available() else None,
        trust_remote_code=True,
    )
    model.eval()
    logger.info(f"Model loaded on {model.device}")

    # 构建 messages
    messages_list = [build_chat_messages(r) for r in eval_records]

    # 生成响应
    logger.info(f"Generating {max_samples} responses per prompt...")
    all_responses = generate_responses(
        model, tokenizer, messages_list,
        n_samples=max_samples,
        temperature=args.temperature,
        top_p=args.top_p,
        max_new_tokens=args.max_new_tokens,
    )

    # 初始化验证器池
    import os
    os.environ["GRPO_VALIDATOR_WORKERS"] = str(args.workers)
    if args.skip_runtime:
        os.environ["GRPO_SKIP_RUNTIME"] = "1"

    validator_pool = ValidatorPool(
        max_workers=args.workers,
        skip_runtime=args.skip_runtime,
    )

    # 评估
    logger.info("Evaluating responses...")
    all_results = []
    all_ground_truths = []
    details = []

    for idx, (record, responses) in enumerate(zip(eval_records, all_responses)):
        gt = record.get("reward_model", {}).get("ground_truth", {})
        if isinstance(gt, str):
            try:
                gt = json.loads(gt)
            except (json.JSONDecodeError, TypeError):
                gt = {}

        results = evaluate_single_prompt(responses, gt, validator_pool)
        all_results.append(results)
        all_ground_truths.append(gt)

        # 保存详细结果
        details.append({
            "index": idx,
            "seed_id": gt.get("seed_id", ""),
            "difficulty": gt.get("difficulty", ""),
            "results": results,
        })

        if (idx + 1) % 20 == 0 or idx + 1 == len(eval_records):
            print_progress(idx + 1, len(eval_records), prefix="Evaluating")

    # 计算指标
    metrics = compute_metrics(all_results, all_ground_truths, pass_k_values)
    metrics["model"] = args.model
    metrics["eval_data"] = args.eval_data
    metrics["n_prompts"] = len(eval_records)
    metrics["n_samples_per_prompt"] = max_samples
    metrics["temperature"] = args.temperature

    # 保存报告
    report_path = Path(args.out_report)
    ensure_dir(report_path.parent)
    write_json(report_path, metrics)
    logger.info(f"Report saved: {report_path}")

    # 保存详细结果
    details_path = Path(args.out_details)
    ensure_dir(details_path.parent)
    write_jsonl(details_path, details)
    logger.info(f"Details saved: {details_path}")

    # 打印摘要
    print("\n=== Evaluation Summary ===")
    for k in pass_k_values:
        print(f"  Pass@{k}: {metrics.get(f'pass@{k}', 0):.2f}%")
    print(f"  Reward mean: {metrics.get('reward_mean', 0):.4f}")
    print(f"  Parse rate:  {metrics.get('parse_rate', 0):.2f}%")
    print(f"  Lint rate:   {metrics.get('lint_rate', 0):.2f}%")
    print(f"  Plan rate:   {metrics.get('has_plan_rate', 0):.2f}%")
    print("\n  By difficulty:")
    for diff, dm in metrics.get("by_difficulty", {}).items():
        pass1 = dm.get("pass@1", 0)
        count = dm.get("count", 0)
        print(f"    {diff}: Pass@1={pass1:.2f}% (n={count})")
    print("========================\n")


if __name__ == '__main__':
    from transformers import AutoModelForCausalLM, AutoTokenizer
    main()
