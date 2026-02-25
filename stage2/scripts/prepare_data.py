#!/usr/bin/env python3
"""
将 stage0 prompt seeds 转换为 VeRL 所需的 parquet 格式。

Usage:
    python prepare_data.py \
        --seeds stage0/data/prompt_seeds/prompt_seeds.jsonl \
        --out-dir stage2/data/grpo \
        --train-ratio 0.85 \
        --eval-count 300 \
        --seed 42
"""

import argparse
import json
import random
import sys
from pathlib import Path
from typing import Dict, List

sys.path.insert(0, str(Path(__file__).parent))

from common import (
    read_jsonl, get_stage0_path, get_data_path, ensure_dir, get_logger,
    write_json
)

logger = get_logger(__name__)

# 系统指令——必须与 SFT 训练一致
# 精确复制自 stage1/scripts/build_sft_dataset.py:26-31
SYSTEM_INSTRUCTION = """你是一个 Phaser3 游戏开发专家。请根据用户的任务描述，先输出结构化计划 [PLAN]，然后输出完整的 Phaser3 代码。

输出格式要求：
1. 先输出 [PLAN]...[/PLAN] 块，包含需求摘要、API 列表和步骤
2. 然后输出完整的 JavaScript 代码（使用 ```javascript 包裹）
3. 代码必须可独立运行，包含完整的 Game 配置和 Scene 生命周期"""

DATA_SOURCE = "phaser3_grpo"


def format_user_input(seed: dict) -> str:
    """
    格式化 prompt seed 为用户消息文本。
    精确复制自 stage1/scripts/build_sft_dataset.py:34-64 的 format_input 函数。
    """
    lines = []

    # 任务
    task = seed.get('task', '')
    lines.append(f"任务: {task}")
    lines.append("")

    # 难度
    difficulty = seed.get('difficulty', 'medium')
    difficulty_cn = {'easy': '基础', 'medium': '中等', 'hard': '困难'}.get(difficulty, difficulty)
    lines.append(f"难度: {difficulty_cn}")
    lines.append("")

    # 约束
    constraints = seed.get('constraints', [])
    if constraints:
        lines.append("约束:")
        for c in constraints:
            lines.append(f"- {c}")
        lines.append("")

    # 必须使用的 API
    must_use = seed.get('must_use_apis', [])
    if must_use:
        lines.append("必须使用的 API:")
        for api in must_use:
            lines.append(f"- {api}")

    return '\n'.join(lines)


def make_verl_record(seed: dict, split: str, index: int) -> dict:
    """
    将单个 prompt seed 转换为 VeRL 所需格式。

    VeRL 必需字段：data_source, prompt, ability, reward_model, extra_info
    """
    user_text = format_user_input(seed)

    prompt = [
        {"role": "system", "content": SYSTEM_INSTRUCTION},
        {"role": "user", "content": user_text},
    ]

    # ground_truth 包含奖励函数所需的全部元数据
    ground_truth = {
        "seed_id": seed["id"],
        "difficulty": seed.get("difficulty", "medium"),
        "modules": seed.get("modules", []),
        "must_use_apis": seed.get("must_use_apis", []),
        "eval_hints": seed.get("eval_hints", []),
        "tags": seed.get("tags", []),
        "task": seed.get("task", ""),
        "constraints": seed.get("constraints", []),
    }

    # ability 由 modules 生成
    modules = seed.get("modules", [])
    ability = "phaser3_" + "_".join(sorted(set(m.lower() for m in modules[:3]))) if modules else "phaser3_general"

    extra_info = {
        "split": split,
        "index": index,
        "seed_id": seed["id"],
        "difficulty": seed.get("difficulty", "medium"),
    }

    return {
        "data_source": DATA_SOURCE,
        "prompt": prompt,
        "ability": ability,
        "reward_model": {
            "style": "rule",
            "ground_truth": ground_truth,
        },
        "extra_info": extra_info,
    }


def main():
    parser = argparse.ArgumentParser(description='将 prompt seeds 转换为 VeRL parquet')
    parser.add_argument('--seeds', type=str,
                        default=str(get_stage0_path('data/prompt_seeds/prompt_seeds.jsonl')))
    parser.add_argument('--out-dir', type=str,
                        default=str(get_data_path('grpo')))
    parser.add_argument('--eval-count', type=int, default=300,
                        help='固定评估集大小')
    parser.add_argument('--seed', type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)

    # 加载 prompt seeds
    seeds = read_jsonl(args.seeds)
    logger.info(f"Loaded {len(seeds)} prompt seeds from {args.seeds}")

    if not seeds:
        logger.error("No seeds found!")
        return

    # 按难度分层
    by_diff = {"easy": [], "medium": [], "hard": []}
    for s in seeds:
        d = s.get("difficulty", "medium")
        by_diff.setdefault(d, []).append(s)

    eval_seeds = []
    train_seeds = []
    total = len(seeds)

    # 分层抽样评估集
    for diff, diff_seeds in by_diff.items():
        random.shuffle(diff_seeds)
        n_eval = max(1, round(args.eval_count * len(diff_seeds) / total))
        eval_seeds.extend(diff_seeds[:n_eval])
        train_seeds.extend(diff_seeds[n_eval:])

    random.shuffle(train_seeds)
    random.shuffle(eval_seeds)

    logger.info(f"Split: train={len(train_seeds)}, eval={len(eval_seeds)}")

    # 统计难度分布
    for split_name, split_seeds in [("train", train_seeds), ("eval", eval_seeds)]:
        dist = {}
        for s in split_seeds:
            d = s.get("difficulty", "medium")
            dist[d] = dist.get(d, 0) + 1
        logger.info(f"  {split_name} difficulty: {dist}")

    # 转换为 VeRL 格式
    train_records = [make_verl_record(s, "train", i) for i, s in enumerate(train_seeds)]
    eval_records = [make_verl_record(s, "eval", i) for i, s in enumerate(eval_seeds)]

    # 保存为 parquet
    try:
        import pandas as pd
    except ImportError:
        logger.error("pandas is required: pip install pandas pyarrow")
        return

    out_dir = Path(args.out_dir)
    ensure_dir(out_dir)

    train_df = pd.DataFrame(train_records)
    eval_df = pd.DataFrame(eval_records)

    train_path = out_dir / "train.parquet"
    eval_path = out_dir / "eval.parquet"

    train_df.to_parquet(train_path, index=False)
    eval_df.to_parquet(eval_path, index=False)

    logger.info(f"Saved train: {train_path} ({len(train_df)} rows)")
    logger.info(f"Saved eval: {eval_path} ({len(eval_df)} rows)")
    logger.info(f"Columns: {list(train_df.columns)}")

    # 保存数据准备报告
    report = {
        "total_seeds": len(seeds),
        "train_count": len(train_seeds),
        "eval_count": len(eval_seeds),
        "train_path": str(train_path),
        "eval_path": str(eval_path),
        "columns": list(train_df.columns),
        "difficulty_distribution": {
            "train": {s.get("difficulty", "medium"): 0 for s in train_seeds},
            "eval": {s.get("difficulty", "medium"): 0 for s in eval_seeds},
        },
        "random_seed": args.seed,
        "data_source": DATA_SOURCE,
    }
    for s in train_seeds:
        report["difficulty_distribution"]["train"][s.get("difficulty", "medium")] += 1
    for s in eval_seeds:
        report["difficulty_distribution"]["eval"][s.get("difficulty", "medium")] += 1

    report_path = out_dir / "reports" / "data_prepare_report.json"
    ensure_dir(report_path.parent)
    write_json(report_path, report)
    logger.info(f"Report: {report_path}")


if __name__ == '__main__':
    main()
