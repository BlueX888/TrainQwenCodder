#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
import random
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import torch
from tqdm import tqdm
from transformers import AutoModelForCausalLM, AutoTokenizer


def read_jsonl(path: Path) -> List[Dict]:
    rows: List[Dict] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))
    return rows


def write_jsonl(path: Path, rows: Iterable[Dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def set_seed(seed: int) -> None:
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def build_user_prompt(row: Dict) -> str:
    task = (row.get("task") or "").strip()
    difficulty = (row.get("difficulty") or "").strip()
    constraints = row.get("constraints") or []
    must_use = row.get("must_use_apis") or []
    eval_hints = row.get("eval_hints") or []

    parts = []
    parts.append(f"任务: {task}")
    if difficulty:
        parts.append(f"\n难度: {difficulty}")

    if constraints:
        parts.append("\n约束:\n- " + "\n- ".join(str(x) for x in constraints))

    if must_use:
        parts.append("\n必须使用的 API:\n- " + "\n- ".join(str(x) for x in must_use))

    if eval_hints:
        parts.append("\n验证要点:\n- " + "\n- ".join(str(x) for x in eval_hints))

    return "\n".join(parts)


def build_prompt_text(
    user_prompt: str,
    system_prompt: str,
    tokenizer,
    use_chat_template: bool,
) -> str:
    if use_chat_template and hasattr(tokenizer, "apply_chat_template"):
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        return tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    # Fallback: plain concatenation
    return f"{system_prompt}\n\n{user_prompt}\n"


@dataclass
class GenConfig:
    temperature: float
    top_p: float
    top_k: int
    max_new_tokens: int
    repetition_penalty: float
    do_sample: bool


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="Base 或 SFT 模型路径/名称")
    ap.add_argument("--prompts", required=True, help="prompts_eval.jsonl")
    ap.add_argument("--out", required=True, help="输出 jsonl")
    ap.add_argument("--system-prompt", default="你是一个 Phaser3 游戏开发专家。请根据用户的任务描述，先输出结构化计划 [PLAN]，然后输出完整的 Phaser3 代码。\n\n输出格式要求：\n1. 先输出 [PLAN]...[/PLAN] 块，包含需求摘要、API 列表和步骤\n2. 然后输出完整的 JavaScript 代码（使用 ```javascript 包裹）\n3. 代码必须可独立运行，包含完整的 Game 配置和 Scene 生命周期")
    ap.add_argument("--use-chat-template", action="store_true", default=True)
    ap.add_argument("--no-chat-template", dest="use_chat_template", action="store_false")
    ap.add_argument("--temperature", type=float, default=0.2)
    ap.add_argument("--top-p", type=float, default=0.9)
    ap.add_argument("--top-k", type=int, default=50)
    ap.add_argument("--max-new-tokens", type=int, default=800)
    ap.add_argument("--repetition-penalty", type=float, default=1.05)
    ap.add_argument("--do-sample", action="store_true", default=True)
    ap.add_argument("--no-sample", dest="do_sample", action="store_false")
    ap.add_argument("--seeds", default="42", help="逗号分隔 seeds；Pass@8 用 8 个")
    ap.add_argument("--batch-size", type=int, default=1)
    ap.add_argument("--device-map", default="auto")
    ap.add_argument("--dtype", default="auto", choices=["auto", "float16", "bfloat16", "float32"])
    ap.add_argument("--trust-remote-code", action="store_true", default=True)
    args = ap.parse_args()

    prompts_path = Path(args.prompts)
    rows = read_jsonl(prompts_path)
    if not rows:
        raise SystemExit(f"empty prompts: {prompts_path}")

    seeds = [int(s.strip()) for s in args.seeds.split(",") if s.strip()]
    if not seeds:
        raise SystemExit("no seeds provided")

    # Load model/tokenizer
    print(f"{'='*60}")
    print(f"加载模型: {args.model}")
    print(f"{'='*60}")
    
    dtype_map = {
        "auto": "auto",
        "float16": torch.float16,
        "bfloat16": torch.bfloat16,
        "float32": torch.float32,
    }
    model_dtype = dtype_map[args.dtype]

    print("正在加载 tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(args.model, trust_remote_code=args.trust_remote_code)
    print(f"  ✓ Tokenizer 加载完成 (vocab_size={tokenizer.vocab_size})")
    
    print("正在加载模型...")
    load_start = time.time()
    model = AutoModelForCausalLM.from_pretrained(
        args.model,
        dtype=model_dtype,
        device_map=args.device_map,
        trust_remote_code=args.trust_remote_code,
    )
    load_time = time.time() - load_start
    print(f"  ✓ 模型加载完成 (耗时 {load_time:.2f}s)")
    print(f"  设备: {next(model.parameters()).device}")
    print(f"  数据类型: {next(model.parameters()).dtype}")
    model.eval()

    if tokenizer.pad_token_id is None:
        tokenizer.pad_token_id = tokenizer.eos_token_id

    gen_cfg = GenConfig(
        temperature=args.temperature,
        top_p=args.top_p,
        top_k=args.top_k,
        max_new_tokens=args.max_new_tokens,
        repetition_penalty=args.repetition_penalty,
        do_sample=args.do_sample,
    )

    outputs: List[Dict] = []
    batch_size = max(1, int(args.batch_size))
    total_generations = len(rows) * len(seeds)

    print(f"\n{'='*60}")
    print(f"生成配置:")
    print(f"  temperature={gen_cfg.temperature}, top_p={gen_cfg.top_p}, top_k={gen_cfg.top_k}")
    print(f"  max_new_tokens={gen_cfg.max_new_tokens}, repetition_penalty={gen_cfg.repetition_penalty}")
    print(f"  do_sample={gen_cfg.do_sample}")
    print(f"{'='*60}")
    print(f"Prompts 数量: {len(rows)}")
    print(f"Seeds: {seeds}")
    print(f"Batch size: {batch_size}")
    print(f"总生成数量: {total_generations}")
    print(f"{'='*60}\n")
    batch_size = max(1, int(args.batch_size))
    gen_start_time = time.time()
    pbar = tqdm(total=total_generations, desc="生成进度", unit="sample")

    for seed_idx, seed in enumerate(seeds):
        set_seed(seed)
        sample_id = 0
        # Simple batching
        for i in range(0, len(rows), batch_size):
            batch = rows[i : i + batch_size]
            prompts = []
            for r in batch:
                user_prompt = build_user_prompt(r)
                prompt_text = build_prompt_text(user_prompt, args.system_prompt, tokenizer, args.use_chat_template)
                prompts.append(prompt_text)

            enc = tokenizer(
                prompts,
                return_tensors="pt",
                padding=True,
            ).to(model.device)

            with torch.no_grad():
                gen = model.generate(
                    **enc,
                    do_sample=gen_cfg.do_sample,
                    temperature=gen_cfg.temperature,
                    top_p=gen_cfg.top_p,
                    top_k=gen_cfg.top_k,
                    max_new_tokens=gen_cfg.max_new_tokens,
                    repetition_penalty=gen_cfg.repetition_penalty,
                    pad_token_id=tokenizer.pad_token_id,
                    eos_token_id=tokenizer.eos_token_id,
                )

            # Decode only newly generated tokens
            for idx, r in enumerate(batch):
                prompt_len = enc.input_ids[idx].shape[0]
                generated_tokens = len(gen[idx]) - prompt_len
                text = tokenizer.decode(gen[idx][prompt_len:], skip_special_tokens=True)
                outputs.append(
                    {
                        "prompt_id": r.get("id"),
                        "sample_id": sample_id,
                        "seed": seed,
                        "text": text,
                        "meta": {
                            "temperature": gen_cfg.temperature,
                            "top_p": gen_cfg.top_p,
                            "top_k": gen_cfg.top_k,
                            "max_new_tokens": gen_cfg.max_new_tokens,
                            "repetition_penalty": gen_cfg.repetition_penalty,
                        },
                    }
                )
                sample_id += 1
                pbar.update(1)
    
    pbar.close()
    gen_total_time = time.time() - gen_start_time
    
    print(f"\n{'='*60}")
    print(f"生成完成!")
    print(f"  总耗时: {gen_total_time:.2f}s")
    print(f"  平均每样本: {gen_total_time/total_generations:.2f}s")
    print(f"  生成样本数: {len(outputs)}")

    write_jsonl(Path(args.out), outputs)
    print(f"  输出文件: {args.out}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
