#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from api_index import ApiIndex
from common import clamp01, effective_code_ratio, extract_plan_code, non_empty_lines, normalized_code_hash, parse_plan_json
from must_use import derive_must_use_checks
from validator_client import ValidatorConfig, validate_with_cache


REWARD_VERSION = "v0.1.0"


CH2EN_HINTS = {
    "场景": ["scene"],
    "切场景": ["scene", "start"],
    "物理": ["physics", "arcade"],
    "重力": ["gravity"],
    "碰撞": ["collider", "overlap", "collision"],
    "输入": ["input"],
    "鼠标": ["pointer"],
    "触摸": ["pointer", "touch"],
    "键盘": ["keyboard", "cursors", "keys", "space"],
    "拖拽": ["drag"],
    "动画": ["animation", "anims", "tween"],
    "补间": ["tween"],
    "粒子": ["particles", "emitter"],
    "瓦片": ["tilemap"],
    "地图": ["tilemap"],
    "摄像机": ["camera"],
    "文本": ["text"],
    "精灵": ["sprite"],
    "容器": ["container"],
    "图形": ["graphics"],
    "声音": ["sound", "audio"],
    "跳跃": ["jump"],
    "平台": ["platform"],
    "收集": ["collect", "pickup", "score"],
}

_RE_TOKEN = re.compile(r"[^0-9a-zA-Z]+")


def tokenize(s: str) -> Set[str]:
    s = (s or "").lower()
    s = _RE_TOKEN.sub(" ", s)
    toks = [t for t in s.split() if t]
    return set(toks)


def expand_prompt_keywords(prompt: Dict[str, Any]) -> Set[str]:
    parts: List[str] = []
    for k in ("task",):
        v = prompt.get(k)
        if isinstance(v, str) and v.strip():
            parts.append(v.strip())
    for k in ("constraints", "eval_hints", "tags", "modules"):
        v = prompt.get(k)
        if isinstance(v, list):
            parts.extend(str(x) for x in v if x is not None)
    text = "\n".join(parts)

    out = set()
    out |= tokenize(text)
    for ch, en in CH2EN_HINTS.items():
        if ch in text:
            out |= set(en)
    return out


EVENT_EMITTER_METHODS = {"on", "once", "off", "emit", "addlistener", "removelistener"}


def normalize_plan_api(api: str, api_index: ApiIndex) -> str:
    s = api_index.normalize_token(api)
    if not s:
        return ""

    # Normalize event emitter methods (often inherited)
    if "#" in s:
        owner, name = s.split("#", 1)
        name_l = name.lower()
        if name_l in EVENT_EMITTER_METHODS:
            return f"Phaser.Events.EventEmitter#{name_l}"

    # keep member strings as-is ("this.add.text")
    return s


def count_plan_fields(plan: Dict[str, Any]) -> Tuple[bool, bool, bool]:
    req = plan.get("requirements")
    apis = plan.get("apis")
    steps = plan.get("steps")
    has_req = isinstance(req, list) and len(req) > 0
    has_apis = isinstance(apis, list) and len(apis) > 0
    has_steps = isinstance(steps, list) and len(steps) > 0
    return has_req, has_apis, has_steps


def steps_min_for_difficulty(difficulty: str) -> int:
    d = (difficulty or "").lower().strip()
    if d == "easy":
        return 2
    return 3


def structure_plan_score(plan: Dict[str, Any], difficulty: str) -> float:
    has_req, has_apis, has_steps = count_plan_fields(plan)
    score = 0.0
    score += 1.0 if has_req else 0.0
    score += 1.0 if has_apis else 0.0
    if has_steps:
        steps = plan.get("steps") or []
        need = steps_min_for_difficulty(difficulty)
        score += 1.0 if len(steps) >= need else max(0.0, len(steps) / max(1, need))
    return clamp01(score / 3.0)


def requirements_api_score(plan: Dict[str, Any], prompt: Dict[str, Any], api_index: ApiIndex) -> float:
    apis = plan.get("apis")
    if not isinstance(apis, list) or not apis:
        return 0.0

    normalized = [normalize_plan_api(str(a), api_index) for a in apis]
    normalized = [a for a in normalized if a]
    if not normalized:
        return 0.0

    exist = 0
    api_tokens = set()
    for a in normalized:
        api_tokens |= tokenize(a)
        if a.startswith("this."):
            # allow "this.*" as a reference; existence will be checked in plan-code consistency
            exist += 1
            continue
        if api_index.exists(a):
            exist += 1
    exist_ratio = exist / len(normalized)

    prompt_tokens = expand_prompt_keywords(prompt)
    overlap = len(prompt_tokens & api_tokens) / max(1, len(prompt_tokens))
    overlap_score = clamp01(overlap * 3.0)  # amplify small overlaps

    return clamp01(0.7 * exist_ratio + 0.3 * overlap_score)


def extract_lifecycle_mentions(steps: List[Any]) -> Set[str]:
    text = " ".join(str(s) for s in steps if s is not None).lower()
    out = set()
    for k in ("preload", "create", "update"):
        if k in text:
            out.add(k)
    return out


def plan_code_consistency_score(plan: Dict[str, Any], code: str, validator: Dict[str, Any], api_index: ApiIndex) -> float:
    apis = plan.get("apis")
    if not isinstance(apis, list) or not apis:
        return 0.0

    plan_set: Set[str] = set()
    for a in apis:
        s = normalize_plan_api(str(a), api_index)
        if not s:
            continue
        plan_set.add(s)

    hits = validator.get("api_usage", {}).get("hits") or []
    hit_ids = {str(h.get("symbol_id", "")) for h in hits if isinstance(h, dict)}

    # Forward: plan apis should appear in code (via hits or raw substring).
    forward_total = 0
    forward_hit = 0
    for a in plan_set:
        if not a:
            continue
        # only enforce for Phaser.* tokens and this.* tokens
        if not (a.startswith("Phaser.") or a.startswith("this.")):
            continue
        forward_total += 1
        if a in hit_ids or (a in (code or "")):
            forward_hit += 1
    forward = 1.0 if forward_total == 0 else (forward_hit / forward_total)

    # Reverse: top code APIs should be mentioned in plan.
    core_hits = [hid for hid in hit_ids if hid and hid != "Phaser.Game"]
    core_hits.sort()
    core_hits = core_hits[:5]
    reverse_total = len(core_hits)
    reverse_hit = sum(1 for hid in core_hits if hid in plan_set)
    reverse = 1.0 if reverse_total == 0 else (reverse_hit / reverse_total)

    # Steps mapping: if plan mentions lifecycle, code should include those.
    steps = plan.get("steps") or []
    mentions = extract_lifecycle_mentions(steps if isinstance(steps, list) else [])
    signals = validator.get("signals") or {}
    need_total = len(mentions)
    need_hit = 0
    if "preload" in mentions and signals.get("has_preload", False):
        need_hit += 1
    if "create" in mentions and signals.get("has_create", False):
        need_hit += 1
    if "update" in mentions and signals.get("has_update", False):
        need_hit += 1
    steps_score = 1.0 if need_total == 0 else (need_hit / need_total)

    return clamp01(0.4 * forward + 0.4 * reverse + 0.2 * steps_score)


def code_bounds(difficulty: str) -> Tuple[int, int]:
    d = (difficulty or "").lower().strip()
    if d == "easy":
        return 10, 220
    if d == "hard":
        return 30, 420
    return 20, 320


def min_api_hits(difficulty: str) -> int:
    d = (difficulty or "").lower().strip()
    if d == "easy":
        return 2
    if d == "hard":
        return 6
    return 4


def is_unsafe_error(errors: List[Any]) -> bool:
    for e in errors:
        if not isinstance(e, dict):
            continue
        code = str(e.get("code", "")).strip()
        if code in ("eval", "new_function"):
            return True
        if code.startswith("banned_"):
            return True
    return False


def format_code_score(code: str, validator: Dict[str, Any], difficulty: str) -> float:
    code_s = code or ""
    if "```" in code_s:
        return 0.0

    signals = validator.get("signals") or {}
    need = ["has_new_phaser_game", "has_scene_in_config", "has_preload", "has_create"]
    ok = sum(1 for k in need if signals.get(k, False))
    base = ok / len(need)

    # length bounds penalty
    lo, hi = code_bounds(difficulty)
    lines = non_empty_lines(code_s)
    if lines < lo:
        base *= max(0.0, lines / max(1, lo))
    if lines > hi:
        base *= max(0.0, hi / max(1, lines))

    # effective code ratio penalty
    ratio = effective_code_ratio(code_s)
    if ratio < 0.7:
        base *= ratio / 0.7

    # minimum API hits penalty (exclude Phaser.Game)
    hits = validator.get("api_usage", {}).get("hits") or []
    hit_ids = [h.get("symbol_id") for h in hits if isinstance(h, dict)]
    hit_core = [x for x in hit_ids if isinstance(x, str) and x and x != "Phaser.Game"]
    if len(hit_core) < min_api_hits(difficulty):
        base *= len(hit_core) / max(1, min_api_hits(difficulty))

    return clamp01(base)


def code_quality_score(validator: Dict[str, Any], skip_eslint: bool) -> float:
    if skip_eslint:
        return 1.0
    if not validator.get("lint_ok", False):
        return 0.0
    warns = validator.get("warnings") or []
    # only count eslint-related warnings
    w = 0
    for item in warns:
        if not isinstance(item, dict):
            continue
        code = str(item.get("code", "")).strip()
        if code in ("api_index_loaded", "api_index_missing", "runtime_failed"):
            continue
        w += 1
    return clamp01(1.0 - min(0.5, w * 0.02))


def api_accuracy_score(validator: Dict[str, Any]) -> float:
    usage = validator.get("api_usage") or {}
    hits = usage.get("hits") or []
    misses = usage.get("misses") or []
    h = len(hits) if isinstance(hits, list) else 0
    m = len(misses) if isinstance(misses, list) else 0
    if h + m == 0:
        return 0.0
    return clamp01(1.0 - min(1.0, m / (h + m + 1.0)))


def functional_score(validator: Dict[str, Any], must_use_checks: List[str], difficulty: str) -> float:
    usage = validator.get("api_usage") or {}
    must_misses = usage.get("must_use_misses") or []
    if not isinstance(must_misses, list):
        must_misses = []
    total = max(1, len(must_use_checks))
    must_ratio = 1.0 - (len(must_misses) / total)

    signals = validator.get("signals") or {}
    need = ["has_new_phaser_game", "has_scene_in_config", "has_preload", "has_create"]
    got = sum(1 for k in need if signals.get(k, False))
    structure = got / len(need)
    return clamp01(0.6 * must_ratio + 0.4 * structure)


def runtime_score(validator: Dict[str, Any], skip_runtime: bool) -> float:
    if skip_runtime:
        return 1.0
    return 1.0 if validator.get("runtime_ok", False) else 0.0


@dataclass
class RewardConfig:
    plan_weight: float = 0.15
    code_weight: float = 0.85
    runtime_crash_cap: float = 0.2

    # code sub-weights (must sum to 1.0)
    w_functional: float = 0.30
    w_api: float = 0.25
    w_runtime: float = 0.20
    w_quality: float = 0.15
    w_format: float = 0.10


def compute_reward(
    *,
    prompt: Dict[str, Any],
    text: str,
    api_index: ApiIndex,
    validator_cfg: ValidatorConfig,
    reward_cfg: RewardConfig,
    cache: Dict[str, Dict[str, Any]],
    cache_path: Optional[Path],
    code_dir: Optional[Path],
    save_codes: bool,
    meta: Dict[str, Any],
) -> Dict[str, Any]:
    extracted = extract_plan_code(text)
    plan_obj, plan_raw = parse_plan_json(extracted.plan_raw)
    code = extracted.code_raw

    difficulty = str(prompt.get("difficulty", "medium")).lower().strip()
    must_use_raw = prompt.get("must_use_apis") or []
    must_use_raw = [str(x) for x in must_use_raw if x is not None]
    must_use_checks = derive_must_use_checks(must_use_raw)

    vres = validate_with_cache(
        cfg=validator_cfg,
        code=code,
        must_use_checks=must_use_checks,
        cache_path=cache_path,
        code_dir=code_dir,
        save_codes=save_codes,
        cache=cache,
        meta=meta,
    )
    validator = vres["validator"]

    gates = {
        "reward_version": REWARD_VERSION,
        "plan_valid": plan_obj is not None,
        "parse_ok": bool(validator.get("parse_ok", False)),
        "unsafe": is_unsafe_error(validator.get("errors") or []),
        "runtime_evaluated": not bool(validator_cfg.skip_runtime),
        "runtime_ok": bool(validator.get("runtime_ok", False)),
    }

    # Plan reward
    if plan_obj is None:
        r_plan = 0.0
        plan_detail = {"score": 0.0, "components": {"structure": 0.0, "req_api": 0.0, "plan_code": 0.0}}
        plan_apis_norm = []
    else:
        s_structure = structure_plan_score(plan_obj, difficulty)
        s_req_api = requirements_api_score(plan_obj, prompt, api_index)
        s_plan_code = plan_code_consistency_score(plan_obj, code, validator, api_index)
        r_plan = clamp01(0.3 * s_structure + 0.2 * s_req_api + 0.5 * s_plan_code)
        plan_detail = {"score": r_plan, "components": {"structure": s_structure, "req_api": s_req_api, "plan_code": s_plan_code}}
        apis = plan_obj.get("apis") if isinstance(plan_obj.get("apis"), list) else []
        plan_apis_norm = [normalize_plan_api(str(a), api_index) for a in apis]

    # Code reward with gates
    if not gates["parse_ok"] or gates["unsafe"]:
        r_code = 0.0
        code_detail = {
            "score": 0.0,
            "components": {"functional": 0.0, "api": 0.0, "runtime": 0.0, "quality": 0.0, "format": 0.0},
        }
    else:
        s_func = functional_score(validator, must_use_checks, difficulty)
        s_api = api_accuracy_score(validator)
        s_run = runtime_score(validator, bool(validator_cfg.skip_runtime))
        s_qual = code_quality_score(validator, bool(validator_cfg.skip_eslint))
        s_fmt = format_code_score(code, validator, difficulty)

        code_cfg_sum = reward_cfg.w_functional + reward_cfg.w_api + reward_cfg.w_runtime + reward_cfg.w_quality + reward_cfg.w_format
        if abs(code_cfg_sum - 1.0) > 1e-6:
            # Renormalize defensively
            wf = reward_cfg.w_functional / code_cfg_sum
            wa = reward_cfg.w_api / code_cfg_sum
            wr = reward_cfg.w_runtime / code_cfg_sum
            wq = reward_cfg.w_quality / code_cfg_sum
            wfm = reward_cfg.w_format / code_cfg_sum
        else:
            wf, wa, wr, wq, wfm = (
                reward_cfg.w_functional,
                reward_cfg.w_api,
                reward_cfg.w_runtime,
                reward_cfg.w_quality,
                reward_cfg.w_format,
            )

        r_code = clamp01(wf * s_func + wa * s_api + wr * s_run + wq * s_qual + wfm * s_fmt)

        # runtime crash cap
        if gates["runtime_evaluated"] and not gates["runtime_ok"]:
            r_code = min(r_code, float(reward_cfg.runtime_crash_cap))

        code_detail = {"score": r_code, "components": {"functional": s_func, "api": s_api, "runtime": s_run, "quality": s_qual, "format": s_fmt}}

    total = clamp01(reward_cfg.plan_weight * r_plan + reward_cfg.code_weight * r_code)

    # Extra debug fields helpful for rollout analysis.
    reward = {
        "version": REWARD_VERSION,
        "total": total,
        "plan": plan_detail,
        "code": code_detail,
        "gates": gates,
        "debug": {
            "code_hash": vres["code_hash"],
            "norm_code_hash": normalized_code_hash(code),
            "must_use_raw": must_use_raw,
            "must_use_checks": must_use_checks,
            "plan_apis_norm": plan_apis_norm,
        },
    }

    return {
        "text": text,
        "plan": plan_obj,
        "plan_raw": plan_raw,
        "code": code,
        "validation": validator,
        "reward": reward,
    }
