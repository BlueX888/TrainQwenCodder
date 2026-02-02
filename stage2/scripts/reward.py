#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from common import Extracted, extract_plan_code, parse_plan_json, parse_plan_text
from must_use import derive_must_use_checks
from validator_client import ValidatorConfig, load_cache, validate_with_cache


UNSAFE_ERROR_CODES = {
    "banned_require",
    "banned_import",
    "banned_import_decl",
    "new_function",
    "eval",
}


STRUCTURE_KEYS_REQUIRED = ["has_new_phaser_game", "has_scene_in_config", "has_preload", "has_create"]


def clamp01(x: float) -> float:
    return max(0.0, min(1.0, float(x)))


def safe_mean(xs: List[float]) -> float:
    if not xs:
        return 0.0
    return float(sum(xs)) / float(len(xs))


def is_unsafe(errors: Any) -> bool:
    if not isinstance(errors, list):
        return False
    for e in errors:
        if not isinstance(e, dict):
            continue
        code = str(e.get("code", "")).strip()
        if code in UNSAFE_ERROR_CODES:
            return True
    return False


def norm_diff(d: Any) -> str:
    s = str(d or "").lower().strip()
    if s in ("easy", "medium", "hard"):
        return s
    return "medium"


def api_accuracy(validator: Dict[str, Any]) -> float:
    usage = validator.get("api_usage") or {}
    hits = usage.get("hits") or []
    misses = usage.get("misses") or []
    h = len(hits) if isinstance(hits, list) else 0
    m = len(misses) if isinstance(misses, list) else 0
    if (h + m) == 0:
        return 1.0 if bool(validator.get("api_ok", False)) else 0.0
    return clamp01(h / (h + m))


def must_use_hit_rate(validator: Dict[str, Any], must_use_checks: List[str]) -> float:
    usage = validator.get("api_usage") or {}
    must_misses = usage.get("must_use_misses") or []
    if not isinstance(must_misses, list):
        must_misses = []
    denom = max(1, len(must_use_checks))
    return clamp01(1.0 - (len(must_misses) / denom))


def structure_score(signals: Any) -> float:
    if not isinstance(signals, dict):
        return 0.0
    base = safe_mean([1.0 if bool(signals.get(k, False)) else 0.0 for k in STRUCTURE_KEYS_REQUIRED])
    bonus = 0.2 if bool(signals.get("has_update", False)) else 0.0
    return clamp01(base + bonus)


def format_score(code: str, signals: Any) -> float:
    if not code or not str(code).strip():
        return 0.0
    if not isinstance(signals, dict) or not bool(signals.get("has_new_phaser_game", False)):
        return 0.0
    lines = [ln for ln in str(code).splitlines() if ln.strip()]
    # Encourage "not too short" code; saturate at 20 lines.
    return clamp01(len(lines) / 20.0)


def normalize_plan_obj(plan_obj: Dict[str, Any]) -> Dict[str, Any]:
    reqs = plan_obj.get("requirements")
    if reqs is None:
        reqs = plan_obj.get("req")
    apis = plan_obj.get("apis")
    if apis is None:
        apis = plan_obj.get("api")
    steps = plan_obj.get("steps")

    def to_list_str(x: Any) -> List[str]:
        if x is None:
            return []
        if isinstance(x, str):
            s = x.strip()
            return [s] if s else []
        if isinstance(x, list):
            out: List[str] = []
            for it in x:
                s = str(it).strip()
                if s:
                    out.append(s)
            return out
        return [str(x).strip()] if str(x).strip() else []

    return {
        "requirements": to_list_str(reqs),
        "apis": to_list_str(apis),
        "steps": to_list_str(steps),
        "notes": str(plan_obj.get("notes", "") or "").strip(),
    }


def plan_structure_score(plan_obj: Dict[str, Any], difficulty: str) -> float:
    reqs = plan_obj.get("requirements") or []
    apis = plan_obj.get("apis") or []
    steps = plan_obj.get("steps") or []

    req_ok = len(reqs) > 0 and bool(str(reqs[0]).strip())
    apis_ok = len(apis) > 0
    need_steps = 2 if norm_diff(difficulty) == "easy" else 3
    steps_ok = len(steps) >= need_steps

    return safe_mean([1.0 if req_ok else 0.0, 1.0 if apis_ok else 0.0, 1.0 if steps_ok else 0.0])


def plan_consistency_score(plan_obj: Dict[str, Any], code: str, signals: Any) -> float:
    apis = plan_obj.get("apis") or []
    code_s = str(code or "")
    code_lower = code_s.lower()

    hit = 0
    for a in apis:
        tok = str(a).strip()
        if not tok:
            continue
        candidates = [tok]
        if "#" in tok:
            candidates.append(tok.split("#", 1)[1])
        if "." in tok:
            candidates.append(tok.split(".")[-1])
        # Also allow stripping common "Phaser." prefix.
        if tok.startswith("Phaser."):
            candidates.append(tok[len("Phaser.") :])
        ok = False
        for c in candidates:
            c = str(c).strip()
            if not c or len(c) < 3:
                continue
            if c.lower() in code_lower:
                ok = True
                break
        if ok:
            hit += 1

    api_hit_rate = (hit / len(apis)) if apis else 0.0

    # Lifecycle hints in steps -> check AST signals (best-effort).
    steps_text = "\n".join([str(x) for x in (plan_obj.get("steps") or [])]).lower()
    want_preload = "preload" in steps_text
    want_create = "create" in steps_text
    want_update = "update" in steps_text

    life_checks: List[float] = []
    if isinstance(signals, dict):
        if want_preload:
            life_checks.append(1.0 if bool(signals.get("has_preload", False)) else 0.0)
        if want_create:
            life_checks.append(1.0 if bool(signals.get("has_create", False)) else 0.0)
        if want_update:
            life_checks.append(1.0 if bool(signals.get("has_update", False)) else 0.0)

    lifecycle_score = safe_mean(life_checks) if life_checks else 1.0
    return clamp01(0.7 * api_hit_rate + 0.3 * lifecycle_score)


@dataclass
class RewardConfig:
    version: str = "v0"
    plan_weight: float = 0.15
    code_weight: float = 0.85

    # Plan components
    plan_w_structure: float = 0.30
    plan_w_req_api: float = 0.20
    plan_w_consistency: float = 0.50

    # Code components
    code_w_functional: float = 0.30
    code_w_api: float = 0.25
    code_w_runtime: float = 0.20
    code_w_quality: float = 0.15
    code_w_format: float = 0.10

    # Gates
    parse_fail_zero_total: bool = True
    unsafe_zero_total: bool = True
    runtime_crash_cap: float = 0.20


def compute_reward(
    *,
    prompt: Dict[str, Any],
    extracted: Extracted,
    plan_obj: Optional[Dict[str, Any]],
    validator: Dict[str, Any],
    cfg: RewardConfig,
    skip_eslint: bool,
    skip_runtime: bool,
) -> Dict[str, Any]:
    difficulty = norm_diff(prompt.get("difficulty"))
    signals = validator.get("signals") or {}

    parse_ok = bool(validator.get("parse_ok", False))
    unsafe = bool(is_unsafe(validator.get("errors") or []))
    lint_ok = True if skip_eslint else bool(validator.get("lint_ok", False))
    runtime_ok = True if skip_runtime else bool(validator.get("runtime_ok", False))

    # --- Plan reward ---
    plan_score = 0.0
    plan_components = {"structure": 0.0, "req_api": 0.0, "consistency": 0.0}
    plan_present = False
    if isinstance(plan_obj, dict):
        plan_present = True
        plan_norm = normalize_plan_obj(plan_obj)
        ps = plan_structure_score(plan_norm, difficulty=difficulty)
        pr = 1.0 if (plan_norm.get("requirements") and plan_norm.get("apis")) else 0.0
        pc = plan_consistency_score(plan_norm, extracted.code_raw, signals=signals)
        plan_components = {"structure": ps, "req_api": pr, "consistency": pc}
        plan_score = (
            cfg.plan_w_structure * ps + cfg.plan_w_req_api * pr + cfg.plan_w_consistency * pc
        )
        plan_score = clamp01(plan_score)

    # --- Code reward ---
    code_components = {"functional": 0.0, "api_accuracy": 0.0, "runtime": 0.0, "quality": 0.0, "format": 0.0}
    code_score = 0.0
    if parse_ok and not unsafe:
        s_struct = structure_score(signals)
        must_use_raw = prompt.get("must_use_apis") or []
        must_use_raw = [str(x) for x in must_use_raw if x is not None]
        must_use_checks = derive_must_use_checks(must_use_raw)
        s_must = must_use_hit_rate(validator, must_use_checks)
        s_func = 0.5 * s_struct + 0.5 * s_must
        s_api = api_accuracy(validator)
        s_rt = 1.0 if runtime_ok else 0.0
        s_q = 1.0 if lint_ok else 0.0
        s_fmt = format_score(extracted.code_raw, signals)

        code_components = {
            "functional": clamp01(s_func),
            "api_accuracy": clamp01(s_api),
            "runtime": clamp01(s_rt),
            "quality": clamp01(s_q),
            "format": clamp01(s_fmt),
        }
        code_score = (
            cfg.code_w_functional * code_components["functional"]
            + cfg.code_w_api * code_components["api_accuracy"]
            + cfg.code_w_runtime * code_components["runtime"]
            + cfg.code_w_quality * code_components["quality"]
            + cfg.code_w_format * code_components["format"]
        )
        code_score = clamp01(code_score)
        if not skip_runtime and not runtime_ok:
            code_score = min(code_score, float(cfg.runtime_crash_cap))

    # --- Total ---
    total = clamp01(cfg.plan_weight * plan_score + cfg.code_weight * code_score)
    if cfg.parse_fail_zero_total and not parse_ok:
        total = 0.0
    if cfg.unsafe_zero_total and unsafe:
        total = 0.0

    return {
        "version": cfg.version,
        "total": float(total),
        "plan": {
            "present": bool(plan_present),
            "score": float(plan_score),
            "components": plan_components,
            "weights": {"structure": cfg.plan_w_structure, "req_api": cfg.plan_w_req_api, "consistency": cfg.plan_w_consistency},
        },
        "code": {
            "score": float(code_score),
            "components": code_components,
            "weights": {
                "functional": cfg.code_w_functional,
                "api_accuracy": cfg.code_w_api,
                "runtime": cfg.code_w_runtime,
                "quality": cfg.code_w_quality,
                "format": cfg.code_w_format,
            },
        },
        "gates": {
            "parse_ok": bool(parse_ok),
            "unsafe": bool(unsafe),
            "lint_ok": bool(lint_ok),
            "runtime_ok": bool(runtime_ok),
        },
    }


def load_prompt_by_id(prompt_jsonl: Path, prompt_id: str) -> Dict[str, Any]:
    for r in prompt_jsonl.open("r", encoding="utf-8"):
        s = r.strip()
        if not s:
            continue
        obj = json.loads(s)
        if str(obj.get("id", "")).strip() == prompt_id:
            return obj
    raise SystemExit(f"prompt_id not found: {prompt_id}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt-seeds", default="stage0/data/prompt_seeds/prompt_seeds.jsonl")
    ap.add_argument("--prompt-id", required=True)
    ap.add_argument("--text-file", required=True)
    ap.add_argument("--validator-cli", default="stage0/validator/src/cli.js")
    ap.add_argument("--api-index", default="stage0/data/api_index/phaser_api.jsonl")
    ap.add_argument("--cache", default="stage2/data/grpo/rewards/validator_cache.jsonl")
    ap.add_argument("--skip-eslint", action="store_true")
    ap.add_argument("--skip-runtime", action="store_true")
    args = ap.parse_args()

    prompt = load_prompt_by_id(Path(args.prompt_seeds), str(args.prompt_id))
    text = Path(args.text_file).read_text(encoding="utf-8")
    extracted = extract_plan_code(text)

    plan_obj, _ = parse_plan_json(extracted.plan_raw)
    if plan_obj is None:
        plan_obj = parse_plan_text(extracted.plan_raw)

    must_use_raw = prompt.get("must_use_apis") or []
    must_use_raw = [str(x) for x in must_use_raw if x is not None]
    must_use_checks = derive_must_use_checks(must_use_raw)

    cfg_v = ValidatorConfig(
        validator_cli=Path(args.validator_cli),
        api_index=Path(args.api_index),
        skip_eslint=bool(args.skip_eslint),
        skip_runtime=bool(args.skip_runtime),
    )
    cache_path = Path(args.cache) if args.cache else None
    cache = load_cache(cache_path)
    vres = validate_with_cache(
        cfg=cfg_v,
        code=extracted.code_raw,
        must_use_checks=must_use_checks,
        cache_path=cache_path,
        code_dir=None,
        save_codes=False,
        cache=cache,
        meta={"tool": "reward.py"},
    )

    reward = compute_reward(
        prompt=prompt,
        extracted=extracted,
        plan_obj=plan_obj,
        validator=vres["validator"],
        cfg=RewardConfig(),
        skip_eslint=bool(args.skip_eslint),
        skip_runtime=bool(args.skip_runtime),
    )
    out = {
        "prompt_id": str(args.prompt_id),
        "plan_raw": extracted.plan_raw,
        "plan": plan_obj,
        "code": extracted.code_raw,
        "validation": vres["validator"],
        "reward": reward,
    }
    print(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    main()

