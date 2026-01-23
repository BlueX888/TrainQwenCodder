#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from api_bm25 import ApiBm25Index
from common import build_user_prompt, iter_jsonl, write_jsonl


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def load_text(path: Path) -> str:
    return path.read_text(encoding="utf-8").strip() + "\n"


def make_request_id(i: int) -> str:
    return f"req_{i:06d}"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt-seeds", default=str(repo_root() / "stage0/data/prompt_seeds/prompt_seeds.jsonl"))
    ap.add_argument("--api-index", default=str(repo_root() / "stage0/data/api_index/phaser_api.jsonl"))
    ap.add_argument("--out", default=str(repo_root() / "stage1/data/sft_distill/requests.jsonl"))
    ap.add_argument("--variants", type=int, default=3)
    ap.add_argument("--top-k", type=int, default=20)
    ap.add_argument("--limit-prompts", type=int, default=0)
    ap.add_argument("--teacher-system-prompt", default=str(repo_root() / "stage1/prompts/teacher_system_prompt.txt"))
    ap.add_argument("--temperature", type=float, default=0.6)
    ap.add_argument("--top-p", type=float, default=0.9)
    ap.add_argument("--max-tokens", type=int, default=1800)
    ap.add_argument("--seed", type=int, default=1234)
    args = ap.parse_args()

    prompt_seeds_path = Path(args.prompt_seeds)
    api_index_path = Path(args.api_index)
    out_path = Path(args.out)
    sys_prompt_path = Path(args.teacher_system_prompt)

    if not prompt_seeds_path.exists():
        raise SystemExit(f"prompt seeds not found: {prompt_seeds_path}")
    if not api_index_path.exists():
        raise SystemExit(f"api index not found: {api_index_path}")
    if not sys_prompt_path.exists():
        raise SystemExit(f"teacher system prompt not found: {sys_prompt_path}")

    sys_prompt = load_text(sys_prompt_path)

    bm25 = ApiBm25Index(api_index_path).build()

    now = datetime.now(timezone.utc).isoformat()
    variants = max(1, int(args.variants))
    top_k = max(0, int(args.top_k))
    limit_prompts = int(args.limit_prompts)

    requests: List[Dict[str, Any]] = []
    req_i = 0

    for p_i, prompt in enumerate(iter_jsonl(prompt_seeds_path), 1):
        if limit_prompts > 0 and p_i > limit_prompts:
            break

        query_parts: List[str] = []
        for k in ("task",):
            v = prompt.get(k)
            if isinstance(v, str) and v.strip():
                query_parts.append(v.strip())
        for k in ("constraints", "eval_hints", "must_use_apis", "tags", "modules"):
            v = prompt.get(k)
            if isinstance(v, list):
                query_parts.extend(str(x) for x in v if x is not None)

        query_text = "\n".join(query_parts)
        api_lines = bm25.format_context_lines(query_text, top_k=top_k) if top_k > 0 else []

        user_text = build_user_prompt(prompt, api_lines)

        for v in range(1, variants + 1):
            req_i += 1
            request_id = make_request_id(req_i)
            requests.append(
                {
                    "request_id": request_id,
                    "prompt_id": prompt.get("id", ""),
                    "variant": v,
                    "prompt": prompt,
                    "messages": [
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": user_text},
                    ],
                    "gen": {
                        "temperature": float(args.temperature),
                        "top_p": float(args.top_p),
                        "max_tokens": int(args.max_tokens),
                        "seed": int(args.seed) + v,
                    },
                    "meta": {
                        "created_at": now,
                        "api_top_k": top_k,
                        "api_context_lines": api_lines,
                    },
                }
            )

    write_jsonl(out_path, requests)

    report = {
        "created_at": now,
        "prompt_seeds": str(prompt_seeds_path),
        "api_index": str(api_index_path),
        "out": str(out_path),
        "variants": variants,
        "top_k": top_k,
        "total_requests": len(requests),
    }
    report_path = out_path.parent.parent / "reports" / "distill_requests_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()

