#!/usr/bin/env python3
"""
将 raw_outputs_claude.jsonl 转换为 SFT 训练格式

输入格式: raw_outputs_claude.jsonl
输出格式: instruction/input/output/metadata 的 SFT 格式
"""

import json
import argparse
from pathlib import Path
from typing import Dict, Any

# 固定的系统指令
SYSTEM_INSTRUCTION = """你是一个 Phaser3 游戏开发专家。请根据用户的任务描述，先输出结构化计划 [PLAN]，然后输出完整的 Phaser3 代码。

输出格式要求：
1. 先输出 [PLAN]...[/PLAN] 块，包含需求摘要、API 列表和步骤
2. 然后输出完整的 JavaScript 代码（使用 ```javascript 包裹）
3. 代码必须可独立运行，包含完整的 Game 配置和 Scene 生命周期"""

# 难度映射
DIFFICULTY_MAP = {
    "easy": "基础",
    "medium": "中等",
    "hard": "高级"
}


def build_input(prompt_meta: Dict[str, Any]) -> str:
    """构建 input 字段"""
    parts = []

    # 任务描述
    task = prompt_meta.get("task", "")
    parts.append(f"任务: {task}")

    # 难度
    difficulty = prompt_meta.get("difficulty", "medium")
    difficulty_cn = DIFFICULTY_MAP.get(difficulty, difficulty)
    parts.append(f"\n难度: {difficulty_cn}")

    # 约束条件
    constraints = prompt_meta.get("constraints", [])
    if constraints:
        parts.append("\n约束:")
        for c in constraints:
            parts.append(f"- {c}")

    # 必须使用的 API
    must_use_apis = prompt_meta.get("must_use_apis", [])
    if must_use_apis:
        parts.append("\n必须使用的 API:")
        for api in must_use_apis:
            parts.append(f"- {api}")

    return "\n".join(parts)


def convert_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """转换单条记录"""
    prompt_meta = record.get("prompt_meta", {})

    # 构建 SFT 格式
    sft_record = {
        "instruction": SYSTEM_INSTRUCTION,
        "input": build_input(prompt_meta),
        "output": record.get("output", record.get("raw_output", "")),
        "metadata": {
            "id": record.get("id", ""),
            "prompt_id": record.get("prompt_id", ""),
            "source": "distill",
            "difficulty": prompt_meta.get("difficulty", "medium"),
            "modules": prompt_meta.get("modules", []),
            "teacher_model": record.get("teacher_model", ""),
            "version": record.get("version", 1)
        }
    }

    return sft_record


def main():
    parser = argparse.ArgumentParser(description="将 raw_outputs 转换为 SFT 格式")
    parser.add_argument(
        "--input", "-i",
        default="/Users/admin/Desktop/TrainQwenCodder/stage1/data/sft_distill/raw_outputs_claude.jsonl",
        help="输入文件路径"
    )
    parser.add_argument(
        "--output", "-o",
        default="/Users/admin/Desktop/TrainQwenCodder/stage1/data/sft_distill/sft_from_raw.jsonl",
        help="输出文件路径"
    )
    parser.add_argument(
        "--preview", "-p",
        type=int,
        default=0,
        help="预览前 N 条记录（不写入文件）"
    )

    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"错误: 输入文件不存在: {input_path}")
        return

    # 读取并转换
    records = []
    with open(input_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                record = json.loads(line)
                sft_record = convert_record(record)
                records.append(sft_record)

    print(f"转换完成: {len(records)} 条记录")

    # 预览模式
    if args.preview > 0:
        print(f"\n预览前 {args.preview} 条:")
        for i, r in enumerate(records[:args.preview]):
            print(f"\n{'='*60}")
            print(f"记录 {i+1}:")
            print(f"instruction: {r['instruction'][:100]}...")
            print(f"input:\n{r['input']}")
            print(f"output: {r['output'][:200]}...")
            print(f"metadata: {r['metadata']}")
        return

    # 写入输出
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print(f"输出文件: {output_path}")

    # 显示样本
    print(f"\n样本预览:")
    sample = records[0]
    print(f"instruction: {sample['instruction'][:80]}...")
    print(f"input:\n{sample['input'][:200]}...")
    print(f"output: {sample['output'][:150]}...")


if __name__ == "__main__":
    main()
