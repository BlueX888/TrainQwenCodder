#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

from common import extract_plan_code, iter_jsonl, parse_plan_json, write_jsonl
from must_use import derive_must_use_checks
from validator_client import ValidatorConfig, load_cache, validate_with_cache


STRUCTURE_KEYS = ["has_new_phaser_game", "has_scene_in_config", "has_preload", "has_create"]

UNSAFE_ERROR_CODES = {
    "banned_require",
    "banned_import",
    "banned_import_decl",
    "banned_import_decl",
    "new_function",
    "eval",
}


def safe_mean(xs: Iterable[float]) -> float:
    s = 0.0
    n = 0
    for x in xs:
        s += float(x)
        n += 1
    return s / n if n else 0.0


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


def structure_ok(signals: Any) -> bool:
    if not isinstance(signals, dict):
        return False
    return all(bool(signals.get(k, False)) for k in STRUCTURE_KEYS)


def api_accuracy(validator: Dict[str, Any]) -> float:
    usage = validator.get("api_usage") or {}
    hits = usage.get("hits") or []
    misses = usage.get("misses") or []
    h = len(hits) if isinstance(hits, list) else 0
    m = len(misses) if isinstance(misses, list) else 0
    return (h / (h + m)) if (h + m) > 0 else 0.0


def must_use_full_hit(validator: Dict[str, Any]) -> bool:
    usage = validator.get("api_usage") or {}
    must_misses = usage.get("must_use_misses") or []
    if not isinstance(must_misses, list):
        must_misses = []
    return len(must_misses) == 0


def must_use_hit_rate(validator: Dict[str, Any], must_use_checks: List[str]) -> float:
    usage = validator.get("api_usage") or {}
    must_misses = usage.get("must_use_misses") or []
    if not isinstance(must_misses, list):
        must_misses = []
    denom = max(1, len(must_use_checks))
    return max(0.0, 1.0 - (len(must_misses) / denom))


def runtime_timeout(validator: Dict[str, Any]) -> bool:
    runtime = validator.get("runtime") or {}
    errs = runtime.get("errors") or []
    if not isinstance(errs, list):
        return False
    for e in errs:
        s = str(e).lower()
        if "runtime_timeout" in s or "timed out" in s:
            return True
    return False


def classify_failure(
    *,
    validator: Dict[str, Any],
    cfg: ValidatorConfig,
    s_ok: bool,
) -> str:
    if not validator.get("parse_ok", False):
        return "parse_failed"
    if is_unsafe(validator.get("errors") or []):
        return "unsafe_code"
    if not cfg.skip_eslint and not validator.get("lint_ok", False):
        return "lint_failed"
    usage = validator.get("api_usage") or {}
    must_misses = usage.get("must_use_misses") or []
    if isinstance(must_misses, list) and len(must_misses) > 0:
        return "must_use_miss"
    misses = usage.get("misses") or []
    if isinstance(misses, list) and len(misses) > 0:
        return "api_miss"
    if not s_ok:
        return "structure_missing"
    if not cfg.skip_runtime and not validator.get("runtime_ok", False):
        return "timeout" if runtime_timeout(validator) else "runtime_crash"
    return "failed_other"


def gate_pass(
    *,
    validator: Dict[str, Any],
    cfg: ValidatorConfig,
    s_ok: bool,
) -> bool:
    if not validator.get("parse_ok", False):
        return False
    if is_unsafe(validator.get("errors") or []):
        return False
    if not cfg.skip_eslint and not validator.get("lint_ok", False):
        return False
    if not validator.get("api_ok", False):
        return False
    if not s_ok:
        return False
    if not cfg.skip_runtime and not validator.get("runtime_ok", False):
        return False
    return True


def load_prompts(path: Path) -> Dict[str, Dict[str, Any]]:
    prompts: Dict[str, Dict[str, Any]] = {}
    for r in iter_jsonl(path):
        pid = str(r.get("id", "")).strip()
        if not pid:
            continue
        prompts[pid] = r
    return prompts


def index_generations(path: Path) -> Dict[str, List[Dict[str, Any]]]:
    out: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for r in iter_jsonl(path):
        pid = str(r.get("prompt_id", "")).strip()
        if not pid:
            continue
        out[pid].append(r)
    for pid, rows in out.items():
        rows.sort(key=lambda x: int(x.get("sample_id", 0) or 0))
    return out


def eval_one_sample(
    *,
    prompt: Dict[str, Any],
    gen: Dict[str, Any],
    cfg: ValidatorConfig,
    cache: Dict[str, Dict[str, Any]],
    cache_path: Path,
    code_dir: Path,
    save_codes: bool,
    meta: Dict[str, Any],
) -> Dict[str, Any]:
    text = str(gen.get("text", "") or "")
    extracted = extract_plan_code(text)
    plan_obj, plan_raw = parse_plan_json(extracted.plan_raw)
    code = extracted.code_raw

    must_use_raw = prompt.get("must_use_apis") or []
    must_use_raw = [str(x) for x in must_use_raw if x is not None]
    must_use_checks = derive_must_use_checks(must_use_raw)

    vres = validate_with_cache(
        cfg=cfg,
        code=code,
        must_use_checks=must_use_checks,
        cache_path=cache_path,
        code_dir=code_dir,
        save_codes=save_codes,
        cache=cache,
        meta=meta,
    )
    validator = vres["validator"]
    s_ok = structure_ok(validator.get("signals") or {})
    passed = gate_pass(validator=validator, cfg=cfg, s_ok=s_ok)
    reason = "passed" if passed else classify_failure(validator=validator, cfg=cfg, s_ok=s_ok)

    rt = validator.get("runtime") or {}
    runtime_ms = float(rt.get("ms", 0) or 0.0) if isinstance(rt, dict) else 0.0
    runtime_crashed = bool(rt.get("crashed", False)) if isinstance(rt, dict) else False

    return {
        "prompt_id": str(prompt.get("id", "")).strip(),
        "difficulty": str(prompt.get("difficulty", "")).lower().strip(),
        "modules": prompt.get("modules") or [],
        "ood": bool(prompt.get("ood", False)),
        "sample_id": int(gen.get("sample_id", 0) or 0),
        "text": text,
        "plan_raw": plan_raw,
        "plan": plan_obj,
        "code": code,
        "validation": validator,
        "derived": {
            "structure_ok": bool(s_ok),
            "unsafe": bool(is_unsafe(validator.get("errors") or [])),
            "gate_pass": bool(passed),
            "fail_reason": reason,
            "api_accuracy": api_accuracy(validator),
            "must_use_full": bool(must_use_full_hit(validator)),
            "must_use_hit_rate": must_use_hit_rate(validator, must_use_checks),
            "runtime_ms": runtime_ms,
            "runtime_crashed": bool(runtime_crashed),
            "cached": bool(vres.get("cached", False)),
            "code_hash": str(vres.get("code_hash", "")),
            "cache_key": str(vres.get("cache_key", "")),
        },
        "meta": gen.get("meta") or {},
    }


def missing_sample(prompt: Dict[str, Any], sample_id: int) -> Dict[str, Any]:
    return {
        "prompt_id": str(prompt.get("id", "")).strip(),
        "difficulty": str(prompt.get("difficulty", "")).lower().strip(),
        "modules": prompt.get("modules") or [],
        "ood": bool(prompt.get("ood", False)),
        "sample_id": int(sample_id),
        "text": "",
        "plan_raw": "",
        "plan": None,
        "code": "",
        "validation": {
            "parse_ok": False,
            "lint_ok": False,
            "api_ok": False,
            "runtime_ok": False,
            "errors": [{"code": "missing_generation", "message": "missing generation"}],
            "warnings": [],
            "api_usage": {"hits": [], "misses": [], "must_use_hits": [], "must_use_misses": []},
            "runtime": {"ms": 0, "crashed": False, "logs": [], "errors": [], "signals": {}},
            "signals": {},
        },
        "derived": {
            "structure_ok": False,
            "unsafe": False,
            "gate_pass": False,
            "fail_reason": "missing_generation",
            "api_accuracy": 0.0,
            "must_use_full": False,
            "must_use_hit_rate": 0.0,
            "runtime_ms": 0.0,
            "runtime_crashed": False,
            "cached": True,
            "code_hash": "",
            "cache_key": "",
        },
        "meta": {},
    }


def prompt_pass_from_results(rows: List[Dict[str, Any]]) -> bool:
    return any(bool(r.get("derived", {}).get("gate_pass", False)) for r in rows)


def collect_prompt_ids(prompts: Dict[str, Dict[str, Any]]) -> List[str]:
    ids = list(prompts.keys())
    ids.sort()
    return ids


def group_prompt_ids_by_module(prompts: Dict[str, Dict[str, Any]]) -> Dict[str, List[str]]:
    out: Dict[str, List[str]] = defaultdict(list)
    for pid, p in prompts.items():
        mods = p.get("modules") or []
        for m in mods:
            ms = str(m).strip()
            if not ms:
                continue
            out[ms].append(pid)
    return out


def aggregate_from_prompt_ids(
    *,
    prompt_ids: List[str],
    pass1_by_prompt: Dict[str, Dict[str, Any]],
    pass8_by_prompt: Dict[str, List[Dict[str, Any]]],
    cfg: ValidatorConfig,
) -> Dict[str, Any]:
    def get1(pid: str) -> Dict[str, Any]:
        return pass1_by_prompt.get(pid) or {}

    def bool1(pid: str, key: str) -> bool:
        r = get1(pid)
        v = r.get("validation", {}).get(key, False)
        return bool(v)

    def derived1(pid: str, key: str, default: Any) -> Any:
        r = get1(pid)
        return (r.get("derived") or {}).get(key, default)

    pass_at_1 = safe_mean(1.0 if bool(derived1(pid, "gate_pass", False)) else 0.0 for pid in prompt_ids)
    pass_at_8 = safe_mean(1.0 if prompt_pass_from_results(pass8_by_prompt.get(pid, [])) else 0.0 for pid in prompt_ids)

    parse_rate = safe_mean(1.0 if bool1(pid, "parse_ok") else 0.0 for pid in prompt_ids)
    lint_rate = 1.0 if cfg.skip_eslint else safe_mean(1.0 if bool1(pid, "lint_ok") else 0.0 for pid in prompt_ids)
    api_ok_rate = safe_mean(1.0 if bool1(pid, "api_ok") else 0.0 for pid in prompt_ids)
    structure_rate = safe_mean(1.0 if bool(derived1(pid, "structure_ok", False)) else 0.0 for pid in prompt_ids)
    must_use_full_rate = safe_mean(1.0 if bool(derived1(pid, "must_use_full", False)) else 0.0 for pid in prompt_ids)
    api_accuracy_mean = safe_mean(float(derived1(pid, "api_accuracy", 0.0)) for pid in prompt_ids)
    runtime_ok_rate = 1.0 if cfg.skip_runtime else safe_mean(1.0 if bool1(pid, "runtime_ok") else 0.0 for pid in prompt_ids)
    crash_rate = 0.0 if cfg.skip_runtime else safe_mean(1.0 if bool(derived1(pid, "runtime_crashed", False)) else 0.0 for pid in prompt_ids)

    return {
        "n_prompts": len(prompt_ids),
        "pass_at_1": pass_at_1,
        "pass_at_8": pass_at_8,
        "parse_rate": parse_rate,
        "lint_rate": lint_rate,
        "api_ok_rate": api_ok_rate,
        "must_use_full_rate": must_use_full_rate,
        "api_accuracy_mean": api_accuracy_mean,
        "structure_rate": structure_rate,
        "runtime_ok_rate": runtime_ok_rate,
        "crash_rate": crash_rate,
    }


def aggregate_pass8_samples(rows: List[Dict[str, Any]], cfg: ValidatorConfig) -> Dict[str, Any]:
    if not rows:
        return {"n_samples": 0}
    pass_rate = safe_mean(1.0 if bool(r.get("derived", {}).get("gate_pass", False)) else 0.0 for r in rows)
    parse_rate = safe_mean(1.0 if bool(r.get("validation", {}).get("parse_ok", False)) else 0.0 for r in rows)
    lint_rate = 1.0 if cfg.skip_eslint else safe_mean(1.0 if bool(r.get("validation", {}).get("lint_ok", False)) else 0.0 for r in rows)
    api_ok_rate = safe_mean(1.0 if bool(r.get("validation", {}).get("api_ok", False)) else 0.0 for r in rows)
    structure_rate = safe_mean(1.0 if bool(r.get("derived", {}).get("structure_ok", False)) else 0.0 for r in rows)
    must_use_full_rate = safe_mean(1.0 if bool(r.get("derived", {}).get("must_use_full", False)) else 0.0 for r in rows)
    api_accuracy_mean = safe_mean(float(r.get("derived", {}).get("api_accuracy", 0.0)) for r in rows)
    runtime_ok_rate = 1.0 if cfg.skip_runtime else safe_mean(1.0 if bool(r.get("validation", {}).get("runtime_ok", False)) else 0.0 for r in rows)
    crash_rate = 0.0 if cfg.skip_runtime else safe_mean(1.0 if bool(r.get("derived", {}).get("runtime_crashed", False)) else 0.0 for r in rows)
    return {
        "n_samples": len(rows),
        "sample_pass_rate": pass_rate,
        "parse_rate": parse_rate,
        "lint_rate": lint_rate,
        "api_ok_rate": api_ok_rate,
        "must_use_full_rate": must_use_full_rate,
        "api_accuracy_mean": api_accuracy_mean,
        "structure_rate": structure_rate,
        "runtime_ok_rate": runtime_ok_rate,
        "crash_rate": crash_rate,
    }


def build_failure_topn(rows: List[Dict[str, Any]], topn: int = 8, examples_per_reason: int = 5) -> Dict[str, Any]:
    c = Counter()
    ex: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for r in rows:
        d = r.get("derived") or {}
        if bool(d.get("gate_pass", False)):
            continue
        reason = str(d.get("fail_reason", "unknown")).strip() or "unknown"
        c[reason] += 1
        if len(ex[reason]) < examples_per_reason:
            ex[reason].append(
                {
                    "prompt_id": r.get("prompt_id", ""),
                    "sample_id": r.get("sample_id", 0),
                    "reason": reason,
                    "meta": r.get("meta") or {},
                }
            )
    top = c.most_common(topn)
    return {"counts": dict(top), "examples": {k: ex[k] for k, _ in top}}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompts", required=True)
    ap.add_argument("--gen-pass1", required=True)
    ap.add_argument("--gen-pass8", required=True)
    ap.add_argument("--model-name", required=True)
    ap.add_argument("--api-index", required=True)
    ap.add_argument("--validator-cli", required=True)
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--timeout-ms", type=int, default=1500)
    ap.add_argument("--frames", type=int, default=60)
    ap.add_argument("--skip-eslint", action="store_true")
    ap.add_argument("--skip-runtime", action="store_true")
    ap.add_argument("--save-codes", action="store_true")
    args = ap.parse_args()

    prompts_path = Path(args.prompts)
    gen1_path = Path(args.gen_pass1)
    gen8_path = Path(args.gen_pass8)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    prompts = load_prompts(prompts_path)
    prompt_ids = collect_prompt_ids(prompts)

    gen1 = index_generations(gen1_path)
    gen8 = index_generations(gen8_path)

    cache_dir = (out_dir.parents[1] / "validator" / str(args.model_name)).resolve() if len(out_dir.parents) >= 2 else (out_dir / "_validator")
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_path = cache_dir / "cache.jsonl"
    code_dir = cache_dir / "codes"

    cfg = ValidatorConfig(
        validator_cli=Path(args.validator_cli),
        api_index=Path(args.api_index),
        timeout_ms=int(args.timeout_ms),
        frames=int(args.frames),
        skip_eslint=bool(args.skip_eslint),
        skip_runtime=bool(args.skip_runtime),
    )

    cache = load_cache(cache_path)

    now = datetime.now(timezone.utc).isoformat()

    # Pass@1 results: one sample per prompt, missing treated as fail.
    pass1_rows: List[Dict[str, Any]] = []
    pass1_by_prompt: Dict[str, Dict[str, Any]] = {}

    for pid in prompt_ids:
        prompt = prompts[pid]
        candidates = gen1.get(pid, [])
        if not candidates:
            r = missing_sample(prompt, sample_id=0)
        else:
            r = eval_one_sample(
                prompt=prompt,
                gen=candidates[0],
                cfg=cfg,
                cache=cache,
                cache_path=cache_path,
                code_dir=code_dir,
                save_codes=bool(args.save_codes),
                meta={"phase": "pass1", "model": args.model_name, "created_at": now},
            )
        pass1_rows.append(r)
        pass1_by_prompt[pid] = r

    # Pass@8 results: evaluate all samples per prompt; missing treated as fail (single row).
    pass8_rows: List[Dict[str, Any]] = []
    pass8_by_prompt: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

    for pid in prompt_ids:
        prompt = prompts[pid]
        candidates = gen8.get(pid, [])
        if not candidates:
            r = missing_sample(prompt, sample_id=0)
            pass8_rows.append(r)
            pass8_by_prompt[pid].append(r)
            continue
        for g in candidates:
            r = eval_one_sample(
                prompt=prompt,
                gen=g,
                cfg=cfg,
                cache=cache,
                cache_path=cache_path,
                code_dir=code_dir,
                save_codes=bool(args.save_codes),
                meta={"phase": "pass8", "model": args.model_name, "created_at": now},
            )
            pass8_rows.append(r)
            pass8_by_prompt[pid].append(r)

    # Write detailed results for replay.
    write_jsonl(out_dir / "results_pass1.jsonl", pass1_rows)
    write_jsonl(out_dir / "results_pass8.jsonl", pass8_rows)

    overall_pass1 = aggregate_from_prompt_ids(prompt_ids=prompt_ids, pass1_by_prompt=pass1_by_prompt, pass8_by_prompt=pass8_by_prompt, cfg=cfg)
    overall_pass8_samples = aggregate_pass8_samples(pass8_rows, cfg)

    # Breakdown groups (prompt-level)
    breakdown_rows: List[Dict[str, Any]] = []

    def add_group(group: str, key: str, ids: List[str]) -> None:
        m = aggregate_from_prompt_ids(prompt_ids=ids, pass1_by_prompt=pass1_by_prompt, pass8_by_prompt=pass8_by_prompt, cfg=cfg)
        breakdown_rows.append({"group": group, "key": key, **m})

    add_group("overall", "all", prompt_ids)

    by_diff: Dict[str, List[str]] = defaultdict(list)
    by_ood: Dict[str, List[str]] = defaultdict(list)
    for pid, p in prompts.items():
        by_diff[str(p.get("difficulty", "")).lower().strip() or "medium"].append(pid)
        by_ood["ood" if p.get("ood") else "iid"].append(pid)
    for diff, ids in sorted(by_diff.items(), key=lambda x: x[0]):
        add_group("difficulty", diff, ids)
    for ok, ids in sorted(by_ood.items(), key=lambda x: x[0]):
        add_group("ood", ok, ids)

    by_module = group_prompt_ids_by_module(prompts)
    for mod, ids in sorted(by_module.items(), key=lambda x: x[0]):
        add_group("module", mod, ids)

    # breakdown.csv
    csv_path = out_dir / "breakdown.csv"
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        fieldnames = [
            "group",
            "key",
            "n_prompts",
            "pass_at_1",
            "pass_at_8",
            "parse_rate",
            "lint_rate",
            "api_ok_rate",
            "must_use_full_rate",
            "api_accuracy_mean",
            "structure_rate",
            "runtime_ok_rate",
            "crash_rate",
        ]
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in breakdown_rows:
            w.writerow({k: r.get(k, "") for k in fieldnames})

    failures = {
        "pass1": build_failure_topn(pass1_rows),
        "pass8_samples": build_failure_topn(pass8_rows),
    }
    (out_dir / "failures_topn.json").write_text(json.dumps(failures, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    summary = {
        "created_at": now,
        "model_name": str(args.model_name),
        "inputs": {
            "prompts": str(prompts_path),
            "gen_pass1": str(gen1_path),
            "gen_pass8": str(gen8_path),
        },
        "validator": {
            "validator_cli": str(cfg.validator_cli),
            "api_index": str(cfg.api_index),
            "timeout_ms": int(cfg.timeout_ms),
            "frames": int(cfg.frames),
            "skip_eslint": bool(cfg.skip_eslint),
            "skip_runtime": bool(cfg.skip_runtime),
        },
        "gating": {
            "structure_keys": STRUCTURE_KEYS,
            "lint_in_gate": not bool(cfg.skip_eslint),
            "runtime_in_gate": not bool(cfg.skip_runtime),
            "unsafe_codes": sorted(UNSAFE_ERROR_CODES),
        },
        "prompt_stats": {"total": len(prompt_ids)},
        "metrics": {
            "pass_at_1": float(overall_pass1["pass_at_1"]),
            "pass_at_8": float(overall_pass1["pass_at_8"]),
            "pass1": overall_pass1,
            "pass8_samples": overall_pass8_samples,
        },
        "outputs": {
            "results_pass1": str(out_dir / "results_pass1.jsonl"),
            "results_pass8": str(out_dir / "results_pass8.jsonl"),
            "breakdown_csv": str(csv_path),
            "failures_topn": str(out_dir / "failures_topn.json"),
        },
    }
    (out_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps({"model": args.model_name, "pass@1": summary["metrics"]["pass_at_1"], "pass@8": summary["metrics"]["pass_at_8"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()

