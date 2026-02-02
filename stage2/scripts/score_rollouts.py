#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
import math
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from common import extract_plan_code, iter_jsonl, parse_plan_json, parse_plan_text, write_jsonl
from must_use import derive_must_use_checks
from reward import RewardConfig, compute_reward
from validator_client import ValidatorConfig, load_cache, validate_with_cache


def load_prompts(path: Path) -> Dict[str, Dict[str, Any]]:
    prompts: Dict[str, Dict[str, Any]] = {}
    for r in iter_jsonl(path):
        pid = str(r.get("id", "")).strip()
        if not pid:
            continue
        prompts[pid] = r
    return prompts


def pop_std(xs: List[float]) -> float:
    if not xs:
        return 0.0
    mu = sum(xs) / float(len(xs))
    var = sum((x - mu) ** 2 for x in xs) / float(len(xs))
    return math.sqrt(max(0.0, var))


def percentile(xs: List[float], p: float) -> float:
    if not xs:
        return 0.0
    ys = sorted(xs)
    p = max(0.0, min(1.0, float(p)))
    idx = int(round(p * (len(ys) - 1)))
    return float(ys[idx])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompts", default="stage2/data/grpo/prompts_train.jsonl")
    ap.add_argument("--rollouts", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--cache", default="stage2/data/grpo/rewards/validator_cache.jsonl")
    ap.add_argument("--code-dir", default="")
    ap.add_argument("--save-codes", action="store_true")
    ap.add_argument("--validator-cli", default="stage0/validator/src/cli.js")
    ap.add_argument("--api-index", default="stage0/data/api_index/phaser_api.jsonl")
    ap.add_argument("--timeout-ms", type=int, default=1500)
    ap.add_argument("--frames", type=int, default=60)
    ap.add_argument("--skip-eslint", action="store_true")
    ap.add_argument("--skip-runtime", action="store_true")
    ap.add_argument("--adv-eps", type=float, default=1e-6)
    ap.add_argument("--adv-std-min", type=float, default=1e-6)
    ap.add_argument("--reward-version", default="v0")
    args = ap.parse_args()

    prompts_path = Path(args.prompts)
    if not prompts_path.exists():
        raise SystemExit(f"prompts not found: {prompts_path}")
    rollouts_path = Path(args.rollouts)
    if not rollouts_path.exists():
        raise SystemExit(f"rollouts not found: {rollouts_path}")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    report_path = out_path.parent.parent / "reports" / (out_path.stem.replace(".jsonl", "") + "_report.json")
    report_path.parent.mkdir(parents=True, exist_ok=True)

    prompts = load_prompts(prompts_path)
    cache_path = Path(args.cache) if args.cache else None
    cache = load_cache(cache_path)

    vcfg = ValidatorConfig(
        validator_cli=Path(args.validator_cli),
        api_index=Path(args.api_index),
        timeout_ms=int(args.timeout_ms),
        frames=int(args.frames),
        skip_eslint=bool(args.skip_eslint),
        skip_runtime=bool(args.skip_runtime),
    )

    rcfg = RewardConfig(version=str(args.reward_version))

    now = datetime.now(timezone.utc).isoformat()
    meta = {"created_at": now, "skip_eslint": bool(args.skip_eslint), "skip_runtime": bool(args.skip_runtime)}

    code_dir = Path(args.code_dir) if args.code_dir else None

    rows_out: List[Dict[str, Any]] = []
    by_prompt: Dict[str, List[int]] = defaultdict(list)

    gate_counts = Counter()
    totals: List[float] = []
    plans: List[float] = []
    codes: List[float] = []

    for r in iter_jsonl(rollouts_path):
        prompt_id = str(r.get("prompt_id", "")).strip()
        if not prompt_id:
            continue
        prompt = prompts.get(prompt_id) or {"id": prompt_id, "difficulty": "medium", "modules": [], "must_use_apis": []}

        text = str(r.get("text", "") or "")
        if not text:
            # Allow pre-split fields.
            plan_raw = str(r.get("plan_raw", "") or "")
            code_raw = str(r.get("code", "") or "")
            text = (plan_raw + "\n\n" + code_raw).strip()

        extracted = extract_plan_code(text)
        plan_obj, _ = parse_plan_json(extracted.plan_raw)
        if plan_obj is None:
            plan_obj = parse_plan_text(extracted.plan_raw)

        must_use_raw = prompt.get("must_use_apis") or []
        must_use_raw = [str(x) for x in must_use_raw if x is not None]
        must_use_checks = derive_must_use_checks(must_use_raw)

        vres = validate_with_cache(
            cfg=vcfg,
            code=extracted.code_raw,
            must_use_checks=must_use_checks,
            cache_path=cache_path,
            code_dir=code_dir,
            save_codes=bool(args.save_codes),
            cache=cache,
            meta={"tool": "score_rollouts.py", **meta},
        )
        validator = vres["validator"]

        reward = compute_reward(
            prompt=prompt,
            extracted=extracted,
            plan_obj=plan_obj,
            validator=validator,
            cfg=rcfg,
            skip_eslint=bool(args.skip_eslint),
            skip_runtime=bool(args.skip_runtime),
        )

        gate = reward.get("gates") or {}
        if not gate.get("parse_ok", True):
            gate_counts["parse_failed"] += 1
        if gate.get("unsafe", False):
            gate_counts["unsafe"] += 1
        if not gate.get("lint_ok", True):
            gate_counts["lint_failed"] += 1
        if not gate.get("runtime_ok", True):
            gate_counts["runtime_failed"] += 1

        total = float(reward.get("total", 0.0) or 0.0)
        totals.append(total)
        plans.append(float((reward.get("plan") or {}).get("score", 0.0) or 0.0))
        codes.append(float((reward.get("code") or {}).get("score", 0.0) or 0.0))

        out_row = dict(r)
        out_row.update(
            {
                "plan_raw": extracted.plan_raw,
                "plan": plan_obj,
                "code": extracted.code_raw,
                "validation": validator,
                "reward": reward,
                "advantage": None,
                "derived": {"cached": bool(vres.get("cached", False)), "code_hash": str(vres.get("code_hash", ""))},
            }
        )
        by_prompt[prompt_id].append(len(rows_out))
        rows_out.append(out_row)

    # Advantage: group-normalize by prompt_id.
    eps = float(args.adv_eps)
    std_min = float(args.adv_std_min)
    adv_stats = {"std_zeroed": 0, "groups": 0}
    for pid, idxs in by_prompt.items():
        rs = [float((rows_out[i].get("reward") or {}).get("total", 0.0) or 0.0) for i in idxs]
        mu = sum(rs) / float(len(rs)) if rs else 0.0
        sd = pop_std(rs)
        adv_stats["groups"] += 1
        if sd < std_min:
            adv_stats["std_zeroed"] += 1
            for i in idxs:
                rows_out[i]["advantage"] = 0.0
            continue
        for i, r_total in zip(idxs, rs):
            rows_out[i]["advantage"] = float((r_total - mu) / (sd + eps))

    write_jsonl(out_path, rows_out)

    report = {
        "created_at": now,
        "inputs": {"prompts": str(prompts_path), "rollouts": str(rollouts_path)},
        "outputs": {"scored": str(out_path), "cache": str(cache_path) if cache_path else None},
        "counts": {
            "samples": len(rows_out),
            "unique_prompts": len(by_prompt),
            "group_size_hist": dict(Counter(len(v) for v in by_prompt.values())),
        },
        "gates": dict(gate_counts),
        "advantage": adv_stats,
        "reward_summary": {
            "total": {"mean": float(sum(totals) / len(totals)) if totals else 0.0, "p50": percentile(totals, 0.50), "p90": percentile(totals, 0.90)},
            "plan": {"mean": float(sum(plans) / len(plans)) if plans else 0.0, "p50": percentile(plans, 0.50), "p90": percentile(plans, 0.90)},
            "code": {"mean": float(sum(codes) / len(codes)) if codes else 0.0, "p50": percentile(codes, 0.50), "p90": percentile(codes, 0.90)},
        },
    }
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote scored={len(rows_out)} -> {out_path}")
    print(f"Wrote report -> {report_path}")


if __name__ == "__main__":
    main()

