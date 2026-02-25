"""
Phaser3 GRPO 奖励函数 (VeRL 兼容)

VeRL 调用签名:
    compute_score(data_source, solution_str, ground_truth, extra_info=None) -> float

Total reward: R = 0.15 * R_plan + 0.85 * R_code - penalty

Gates:
    - AST/parse failure -> R_code = 0
    - Runtime crash -> R_code capped at 0.2
    - Plan missing -> R_plan = 0
"""

import json
import os
import sys
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from parse_output import parse_model_output, ParsedOutput, ParsedPlan
from validator_pool import ValidatorPool, ValidatorResult
from common import compute_hash, count_code_lines, get_logger

logger = get_logger(__name__)

# ==================== 权重配置 ====================

PLAN_WEIGHT = 0.15
CODE_WEIGHT = 0.85

# R_plan 子权重
PLAN_STRUCTURE_W = 0.30
PLAN_API_CONSISTENCY_W = 0.20
PLAN_CODE_CONSISTENCY_W = 0.50

# R_code 子权重
CODE_FUNCTIONAL_W = 0.30
CODE_API_ACCURACY_W = 0.25
CODE_RUNTIME_W = 0.20
CODE_QUALITY_W = 0.15
CODE_FORMAT_W = 0.10

# Hacking 防御阈值（按难度）
DIFFICULTY_PARAMS = {
    "easy": {
        "min_code_lines": 15,
        "max_code_lines": 200,
        "min_effective_ratio": 0.60,
        "min_api_hits": 1,
        "min_plan_steps": 2,
    },
    "medium": {
        "min_code_lines": 25,
        "max_code_lines": 350,
        "min_effective_ratio": 0.65,
        "min_api_hits": 2,
        "min_plan_steps": 3,
    },
    "hard": {
        "min_code_lines": 40,
        "max_code_lines": 500,
        "min_effective_ratio": 0.70,
        "min_api_hits": 3,
        "min_plan_steps": 3,
    },
}

# 全局验证器池单例（懒初始化）
_validator_pool: Optional[ValidatorPool] = None


def _get_validator_pool() -> ValidatorPool:
    """懒初始化验证器池单例"""
    global _validator_pool
    if _validator_pool is None:
        max_workers = int(os.environ.get("GRPO_VALIDATOR_WORKERS", "8"))
        skip_runtime = os.environ.get("GRPO_SKIP_RUNTIME", "1").lower() in ("1", "true", "yes")
        skip_eslint = os.environ.get("GRPO_SKIP_ESLINT", "0").lower() in ("1", "true", "yes")

        _validator_pool = ValidatorPool(
            max_workers=max_workers,
            skip_eslint=skip_eslint,
            skip_runtime=skip_runtime,
        )
    return _validator_pool


# ==================== R_plan 计算 ====================

def compute_r_plan(
    plan: Optional[ParsedPlan],
    code: str,
    vr: ValidatorResult,
    ground_truth: dict,
) -> Tuple[float, dict]:
    """
    计算计划奖励 R_plan ∈ [0, 1]

    子项：
      1. 结构完整性 (30%) - requirements/apis/steps 字段存在
      2. 需求-API 一致性 (20%) - plan.apis 在 API 索引中命中
      3. 计划-代码一致性 (50%) - plan.apis 与代码 AST 命中对齐
    """
    detail = {
        "structure": 0.0,
        "api_consistency": 0.0,
        "code_consistency": 0.0,
        "total": 0.0,
    }

    if plan is None or not plan.is_valid:
        return 0.0, detail

    difficulty = ground_truth.get("difficulty", "medium")
    params = DIFFICULTY_PARAMS.get(difficulty, DIFFICULTY_PARAMS["medium"])

    # --- 1. 结构完整性 (30%) ---
    has_req = bool(plan.requirements)
    has_apis = len(plan.apis) > 0
    has_steps = len(plan.steps) >= params["min_plan_steps"]

    fields_present = sum([has_req, has_apis, has_steps])
    structure_score = fields_present / 3.0
    detail["structure"] = round(structure_score, 4)

    # --- 2. 需求-API 一致性 (20%) ---
    api_consistency = 0.0
    if plan.apis:
        hit_ids = set()
        for h in vr.api_usage.get("hits", []):
            sid = h.get("symbol_id", h) if isinstance(h, dict) else str(h)
            hit_ids.add(sid.lower())

        matched = 0
        for api in plan.apis:
            api_lower = api.lower()
            if any(api_lower in hid or hid.endswith(f"#{api_lower}") for hid in hit_ids):
                matched += 1
            elif api_lower in code.lower():
                matched += 1

        api_consistency = matched / len(plan.apis)

    detail["api_consistency"] = round(api_consistency, 4)

    # --- 3. 计划-代码一致性 (50%) ---
    code_consistency = 0.0
    if plan.apis and code:
        # 正向：plan.apis 应在代码中出现
        forward_matched = 0
        for api in plan.apis:
            api_lower = api.lower()
            if api_lower in code.lower():
                forward_matched += 1
            else:
                parts = api.replace('#', '.').split('.')
                if parts and parts[-1].lower() in code.lower():
                    forward_matched += 1

        forward_score = forward_matched / len(plan.apis)

        # 反向：代码 API hits 应在 plan.apis 中
        code_hit_names = set()
        for h in vr.api_usage.get("hits", []):
            sid = h.get("symbol_id", h) if isinstance(h, dict) else str(h)
            parts = sid.replace('#', '.').split('.')
            if parts:
                code_hit_names.add(parts[-1].lower())

        plan_api_names = set()
        for api in plan.apis:
            parts = api.replace('#', '.').split('.')
            if parts:
                plan_api_names.add(parts[-1].lower())

        if code_hit_names:
            reverse_matched = len(code_hit_names & plan_api_names)
            reverse_score = reverse_matched / len(code_hit_names)
        else:
            reverse_score = 0.5  # 无 code hits 时中性

        # 生命周期一致性加分
        lifecycle_bonus = 0.0
        steps_text = " ".join(plan.steps).lower()
        signals = vr.signals
        if "preload" in steps_text and signals.get("has_preload", False):
            lifecycle_bonus += 0.1
        if "create" in steps_text and signals.get("has_create", False):
            lifecycle_bonus += 0.1
        if "update" in steps_text and signals.get("has_update", False):
            lifecycle_bonus += 0.1

        code_consistency = (
            0.5 * forward_score +
            0.3 * reverse_score +
            0.2 * min(1.0, lifecycle_bonus / 0.3)
        )

    detail["code_consistency"] = round(code_consistency, 4)

    total = (
        PLAN_STRUCTURE_W * structure_score +
        PLAN_API_CONSISTENCY_W * api_consistency +
        PLAN_CODE_CONSISTENCY_W * code_consistency
    )
    detail["total"] = round(total, 4)

    return total, detail


# ==================== R_code 计算 ====================

def compute_r_code(
    code: str,
    vr: ValidatorResult,
    ground_truth: dict,
) -> Tuple[float, dict]:
    """
    计算代码奖励 R_code ∈ [0, 1]

    子项：
      1. 功能完整性 (30%) - must_use 命中 + 生命周期信号
      2. API 准确率 (25%) - misses == 0 → 满分
      3. 运行时正确性 (20%) - runtime_ok → 满分
      4. 代码质量 (15%) - ESLint errors/warnings 扣分
      5. 格式规范 (10%) - Phaser.Game + scene + create
    """
    detail = {
        "functional": 0.0,
        "api_accuracy": 0.0,
        "runtime": 0.0,
        "quality": 0.0,
        "format": 0.0,
        "total": 0.0,
        "gate": "none",
    }

    # === 门控：parse 失败 → R_code = 0 ===
    if not vr.parse_ok:
        detail["gate"] = "parse_failed"
        return 0.0, detail

    # --- 1. 功能完整性 (30%) ---
    must_hits = vr.api_usage.get("must_use_hits", [])
    must_misses = vr.api_usage.get("must_use_misses", [])
    total_must = len(must_hits) + len(must_misses)
    must_use_ratio = len(must_hits) / total_must if total_must > 0 else 1.0

    signals = vr.signals
    lifecycle_signals = [
        signals.get("has_new_phaser_game", False),
        signals.get("has_scene_in_config", False),
        signals.get("has_create", False),
    ]
    lifecycle_ratio = sum(lifecycle_signals) / len(lifecycle_signals)

    optional_signals = [
        signals.get("has_preload", False),
        signals.get("has_update", False),
    ]
    optional_ratio = sum(optional_signals) / len(optional_signals)

    func_score = 0.5 * must_use_ratio + 0.35 * lifecycle_ratio + 0.15 * optional_ratio
    detail["functional"] = round(func_score, 4)

    # --- 2. API 准确率 (25%) ---
    hits = vr.api_usage.get("hits", [])
    misses = vr.api_usage.get("misses", [])
    n_hits = len(hits) if isinstance(hits, list) else 0
    n_misses = len(misses) if isinstance(misses, list) else 0

    if n_misses == 0:
        api_acc = 1.0
    else:
        api_acc = max(0.0, 1.0 - min(1.0, n_misses / (n_hits + n_misses + 1)))

    detail["api_accuracy"] = round(api_acc, 4)

    # --- 3. 运行时正确性 (20%) ---
    runtime_score = 0.0
    if vr.runtime_ok:
        runtime_score = 1.0
    elif vr.runtime.get("crashed", False):
        runtime_score = 0.0
    else:
        # runtime 未运行（skip_runtime）→ 中性分
        runtime_score = 0.5

    detail["runtime"] = round(runtime_score, 4)

    # --- 4. 代码质量 (15%) ---
    quality_score = 1.0
    errors = [e for e in vr.errors if isinstance(e, dict) and e.get("severity") == 2]
    warnings = [w for w in vr.warnings if isinstance(w, dict)]

    if errors:
        quality_score = max(0.0, 1.0 - min(1.0, len(errors) * 0.25))
    if warnings:
        quality_score -= min(0.2, len(warnings) * 0.02)

    quality_score = max(0.0, quality_score)
    detail["quality"] = round(quality_score, 4)

    # --- 5. 格式规范 (10%) ---
    has_phaser_game = signals.get("has_new_phaser_game", False)
    has_scene = signals.get("has_scene_in_config", False)
    has_create = signals.get("has_create", False)

    format_checks = [has_phaser_game, has_scene, has_create]
    format_score = sum(format_checks) / len(format_checks)

    # 代码不应含 markdown 围栏
    if '```' in code:
        format_score *= 0.5

    detail["format"] = round(format_score, 4)

    # === 合并子分数 ===
    raw_total = (
        CODE_FUNCTIONAL_W * func_score +
        CODE_API_ACCURACY_W * api_acc +
        CODE_RUNTIME_W * runtime_score +
        CODE_QUALITY_W * quality_score +
        CODE_FORMAT_W * format_score
    )

    # === 门控：runtime crash → cap 0.2 ===
    if vr.runtime.get("crashed", False) and not vr.runtime_ok:
        detail["gate"] = "runtime_crash"
        raw_total = min(raw_total, 0.2)

    detail["total"] = round(raw_total, 4)
    return raw_total, detail


# ==================== Hacking 防御 ====================

def compute_hacking_penalty(
    code: str,
    plan: Optional[ParsedPlan],
    vr: ValidatorResult,
    ground_truth: dict,
) -> Tuple[float, dict]:
    """
    计算 reward hacking 惩罚 ∈ [0, 0.5]

    防御项：
      - 长度约束（过短/过长）
      - 有效代码行占比
      - API 命中数下限
    """
    detail = {"length": 0.0, "effective_ratio": 0.0, "api_count": 0.0, "total": 0.0}

    if not code:
        return 0.5, detail

    difficulty = ground_truth.get("difficulty", "medium")
    params = DIFFICULTY_PARAMS.get(difficulty, DIFFICULTY_PARAMS["medium"])

    line_stats = count_code_lines(code)
    total_lines = line_stats["total"]
    code_lines = line_stats["code"]

    penalty = 0.0

    # 长度约束
    if total_lines < params["min_code_lines"]:
        length_pen = min(0.3, (params["min_code_lines"] - total_lines) * 0.02)
        detail["length"] = round(length_pen, 4)
        penalty += length_pen
    elif total_lines > params["max_code_lines"]:
        length_pen = min(0.2, (total_lines - params["max_code_lines"]) * 0.001)
        detail["length"] = round(length_pen, 4)
        penalty += length_pen

    # 有效代码行占比
    effective_ratio = code_lines / total_lines if total_lines > 0 else 0.0
    if effective_ratio < params["min_effective_ratio"]:
        ratio_pen = min(0.15, (params["min_effective_ratio"] - effective_ratio) * 0.5)
        detail["effective_ratio"] = round(ratio_pen, 4)
        penalty += ratio_pen

    # API 命中数下限
    hits = vr.api_usage.get("hits", [])
    n_hits = len(hits) if isinstance(hits, list) else 0
    if n_hits < params["min_api_hits"]:
        api_pen = min(0.15, (params["min_api_hits"] - n_hits) * 0.05)
        detail["api_count"] = round(api_pen, 4)
        penalty += api_pen

    detail["total"] = round(min(0.5, penalty), 4)
    return min(0.5, penalty), detail


# ==================== VeRL 入口函数 ====================

def compute_score(
    data_source: str,
    solution_str: str,
    ground_truth: Any,
    extra_info: Any = None,
) -> float:
    """
    VeRL 兼容的奖励函数入口。

    Args:
        data_source: 数据集标识（如 "phaser3_grpo"）
        solution_str: 原始模型输出（含 [PLAN] + code）
        ground_truth: 种子元数据（must_use_apis, difficulty 等）
        extra_info: 可选额外信息

    Returns:
        标量奖励 ∈ [0, 1]
    """
    # ground_truth 可能被 VeRL 序列化为字符串
    if isinstance(ground_truth, str):
        try:
            ground_truth = json.loads(ground_truth)
        except (json.JSONDecodeError, TypeError):
            ground_truth = {}

    if not isinstance(ground_truth, dict):
        ground_truth = {}

    must_use_apis = ground_truth.get("must_use_apis", [])

    # 1. 解析模型输出
    parsed = parse_model_output(solution_str)

    # 2. 无代码 → 最低分
    if not parsed.has_code or not parsed.code.strip():
        return 0.0

    # 3. 调用验证器
    pool = _get_validator_pool()
    vr = pool.validate_single(parsed.code, must_use_apis)

    # 4. 计算 R_plan
    r_plan, plan_detail = compute_r_plan(
        plan=parsed.plan,
        code=parsed.code,
        vr=vr,
        ground_truth=ground_truth,
    )

    # 5. 计算 R_code
    r_code, code_detail = compute_r_code(
        code=parsed.code,
        vr=vr,
        ground_truth=ground_truth,
    )

    # 6. 计算 hacking 惩罚
    penalty, penalty_detail = compute_hacking_penalty(
        code=parsed.code,
        plan=parsed.plan,
        vr=vr,
        ground_truth=ground_truth,
    )

    # 7. 合并
    raw_reward = PLAN_WEIGHT * r_plan + CODE_WEIGHT * r_code
    final_reward = max(0.0, raw_reward - penalty)
    final_reward = round(min(1.0, final_reward), 4)

    return final_reward


def compute_score_detailed(
    data_source: str,
    solution_str: str,
    ground_truth: Any,
    extra_info: Any = None,
) -> dict:
    """
    返回详细奖励明细（用于评估和调试，非 VeRL 接口）。

    返回完整的 reward breakdown 字典。
    """
    if isinstance(ground_truth, str):
        try:
            ground_truth = json.loads(ground_truth)
        except (json.JSONDecodeError, TypeError):
            ground_truth = {}

    if not isinstance(ground_truth, dict):
        ground_truth = {}

    must_use_apis = ground_truth.get("must_use_apis", [])

    parsed = parse_model_output(solution_str)

    if not parsed.has_code or not parsed.code.strip():
        return {
            "total": 0.0,
            "r_plan": 0.0, "r_code": 0.0, "penalty": 0.0,
            "plan_detail": {}, "code_detail": {}, "penalty_detail": {},
            "has_plan": parsed.has_plan, "has_code": False,
            "gate": "no_code",
        }

    pool = _get_validator_pool()
    vr = pool.validate_single(parsed.code, must_use_apis)

    r_plan, plan_detail = compute_r_plan(parsed.plan, parsed.code, vr, ground_truth)
    r_code, code_detail = compute_r_code(parsed.code, vr, ground_truth)
    penalty, penalty_detail = compute_hacking_penalty(parsed.code, parsed.plan, vr, ground_truth)

    raw_reward = PLAN_WEIGHT * r_plan + CODE_WEIGHT * r_code
    final_reward = max(0.0, raw_reward - penalty)
    final_reward = round(min(1.0, final_reward), 4)

    return {
        "total": final_reward,
        "raw_reward": round(raw_reward, 4),
        "r_plan": round(r_plan, 4),
        "r_code": round(r_code, 4),
        "penalty": round(penalty, 4),
        "plan_detail": plan_detail,
        "code_detail": code_detail,
        "penalty_detail": penalty_detail,
        "has_plan": parsed.has_plan,
        "has_code": parsed.has_code,
        "validator": {
            "parse_ok": vr.parse_ok,
            "lint_ok": vr.lint_ok,
            "api_ok": vr.api_ok,
            "runtime_ok": vr.runtime_ok,
        },
    }
