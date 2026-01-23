#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
import math
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from api_index import ApiIndex
from common import iter_jsonl, write_jsonl
from reward import RewardConfig, compute_reward
from validator_client import ValidatorConfig


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def mean(xs: List[float]) -> float:
    return sum(xs) / max(1, len(xs))


def std(xs: List[float]) -> float:
    if not xs:
        return 0.0
    m = mean(xs)
    v = sum((x - m) ** 2 for x in xs) / max(1, len(xs))
    return math.sqrt(v)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompts", default=str(repo_root() / "stage2/data/grpo/prompts_train.jsonl"))
    ap.add_argument("--outputs", default=str(repo_root() / "stage2/data/grpo/mock_outputs.jsonl"))
    ap.add_argument("--out", default=str(repo_root() / "stage2/data/grpo/rollouts/rollouts.jsonl"))
    ap.add_argument("--api-index", default=str(repo_root() / "stage0/data/api_index/phaser_api.jsonl"))
    ap.add_argument("--validator-cli", default=str(repo_root() / "stage0/validator/src/cli.js"))
    ap.add_argument("--validator-cache", default=str(repo_root() / "stage2/data/grpo/rewards/validator_cache.jsonl"))
    ap.add_argument("--code-dir", default=str(repo_root() / "stage2/data/grpo/rewards/codes"))
    ap.add_argument("--save-codes", action="store_true")
    ap.add_argument("--group-size", type=int, default=8)
    ap.add_argument("--step", type=int, default=0)
    ap.add_argument("--report-dir", default=str(repo_root() / "stage2/data/grpo/reports"))
    ap.add_argument("--timeout-ms", type=int, default=1500)
    ap.add_argument("--frames", type=int, default=60)
    ap.add_argument("--skip-eslint", action="store_true")
    ap.add_argument("--skip-runtime", action="store_true")
    ap.add_argument("--epsilon", type=float, default=1e-6)
    ap.add_argument("--diversity-penalty", type=float, default=0.1)
    args = ap.parse_args()

    prompts_path = Path(args.prompts)
    outputs_path = Path(args.outputs)
    out_path = Path(args.out)
    api_index_path = Path(args.api_index)
    validator_cli = Path(args.validator_cli)

    if not prompts_path.exists():
        raise SystemExit(f"prompts not found: {prompts_path}")
    if not outputs_path.exists():
        raise SystemExit(f"outputs not found: {outputs_path}")
    if not api_index_path.exists():
        raise SystemExit(f"api index not found: {api_index_path}")
    if not validator_cli.exists():
        raise SystemExit(f"validator cli not found: {validator_cli}")

    api_index = ApiIndex.load(api_index_path)
    validator_cfg = ValidatorConfig(
        validator_cli=validator_cli,
        api_index=api_index_path,
        timeout_ms=int(args.timeout_ms),
        frames=int(args.frames),
        skip_eslint=bool(args.skip_eslint),
        skip_runtime=bool(args.skip_runtime),
    )
    reward_cfg = RewardConfig()

    prompt_by_id: Dict[str, Dict[str, Any]] = {}
    for p in iter_jsonl(prompts_path):
        pid = str(p.get("id", "")).strip()
        if pid:
            prompt_by_id[pid] = p

    outputs_by_prompt: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for o in iter_jsonl(outputs_path):
        pid = str(o.get("prompt_id", "")).strip()
        if not pid:
            continue
        outputs_by_prompt[pid].append(o)

    cache_path = Path(args.validator_cache) if args.validator_cache else None
    code_dir = Path(args.code_dir) if args.code_dir else None
    if cache_path is not None:
        cache_path.parent.mkdir(parents=True, exist_ok=True)

    cache: Dict[str, Dict[str, Any]] = {}
    if cache_path is not None and cache_path.exists():
        # load existing cache
        for row in iter_jsonl(cache_path):
            k = str(row.get("key", "")).strip()
            v = row.get("validator")
            if k and isinstance(v, dict):
                cache[k] = v

    now = datetime.now(timezone.utc).isoformat()
    group_size = max(1, int(args.group_size))
    epsilon = float(args.epsilon)
    diversity_penalty = max(0.0, float(args.diversity_penalty))

    rollouts: List[Dict[str, Any]] = []
    stats = {
        "created_at": now,
        "step": int(args.step),
        "prompts": 0,
        "rows": 0,
        "group_size": group_size,
        "skip_eslint": bool(args.skip_eslint),
        "skip_runtime": bool(args.skip_runtime),
    }

    for pid, outs in outputs_by_prompt.items():
        prompt = prompt_by_id.get(pid)
        if prompt is None:
            continue
        stats["prompts"] += 1

        # take first group_size outputs (or pad/truncate)
        outs_sorted = sorted(outs, key=lambda x: int(x.get("group_id", 0)))
        group = outs_sorted[:group_size]

        scored: List[Dict[str, Any]] = []
        for o in group:
            res = compute_reward(
                prompt=prompt,
                text=str(o.get("text", "") or ""),
                api_index=api_index,
                validator_cfg=validator_cfg,
                reward_cfg=reward_cfg,
                cache=cache,
                cache_path=cache_path,
                code_dir=code_dir,
                save_codes=bool(args.save_codes),
                meta={"created_at": now, "prompt_id": pid, "step": int(args.step)},
            )
            res["group_id"] = int(o.get("group_id", 0))
            res["prompt_id"] = pid
            res["meta"] = o.get("meta") or {}
            scored.append(res)

        # diversity penalty (duplicates within group)
        seen = set()
        for r in scored:
            h = r.get("reward", {}).get("debug", {}).get("norm_code_hash", "")
            if not isinstance(h, str) or not h:
                continue
            if h in seen:
                r["reward"]["total"] = max(0.0, float(r["reward"]["total"]) - diversity_penalty)
                r["reward"]["debug"]["diversity_penalty"] = diversity_penalty
            else:
                seen.add(h)

        rewards = [float(r["reward"]["total"]) for r in scored]
        mu = mean(rewards)
        sigma = std(rewards)
        if sigma < 1e-12:
            sigma = 0.0

        for r in scored:
            rt = float(r["reward"]["total"])
            if sigma == 0.0:
                adv = 0.0
            else:
                adv = (rt - mu) / (sigma + epsilon)
            rollouts.append(
                {
                    "step": int(args.step),
                    "prompt_id": pid,
                    "group_id": int(r.get("group_id", 0)),
                    "prompt": {
                        "difficulty": prompt.get("difficulty", ""),
                        "modules": prompt.get("modules", []),
                        "ood": prompt.get("ood", False),
                        "source_id": prompt.get("source_id", ""),
                    },
                    "text": r.get("text", ""),
                    "plan": r.get("plan"),
                    "code": r.get("code", ""),
                    "logprobs": None,
                    "reward": r.get("reward"),
                    "advantage": float(adv),
                    "validation": r.get("validation"),
                    "meta": r.get("meta", {}),
                }
            )
            stats["rows"] += 1

    write_jsonl(out_path, rollouts)

    report_dir = Path(args.report_dir)
    report_dir.mkdir(parents=True, exist_ok=True)
    report_path = report_dir / "rollouts_build_report.json"
    report_path.write_text(json.dumps(stats, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(stats, ensure_ascii=False))


if __name__ == "__main__":
    main()
