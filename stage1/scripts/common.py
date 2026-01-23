#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, Iterator, List, Optional, Tuple


def iter_jsonl(path: Path) -> Iterator[Dict[str, Any]]:
    with path.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, 1):
            s = line.strip()
            if not s:
                continue
            try:
                obj = json.loads(s)
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSONL at {path}:{line_no}: {e}") from e
            if not isinstance(obj, dict):
                raise ValueError(f"Expected object at {path}:{line_no}, got {type(obj)}")
            yield obj


def write_jsonl(path: Path, rows: Iterable[Dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def append_jsonl(path: Path, row: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


def sha256_text(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8", errors="ignore")).hexdigest()


_RE_FENCE = re.compile(r"^```(?:\w+)?\s*$")


def strip_markdown_fences(code: str) -> str:
    lines = code.splitlines()
    out: List[str] = []
    for ln in lines:
        if _RE_FENCE.match(ln.strip()):
            continue
        out.append(ln)
    return "\n".join(out).strip()


@dataclass
class Extracted:
    plan_raw: str
    code_raw: str


def extract_plan_code(text: str) -> Extracted:
    """
    Extract `plan:` and `code:` sections from teacher/model output.

    Assumptions:
    - Output contains "plan:" then "code:" (case-insensitive) as section headers.
    - If missing, we try to fall back to first fenced code block as code.
    """

    if text is None:
        return Extracted(plan_raw="", code_raw="")

    s = text.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not s:
        return Extracted(plan_raw="", code_raw="")

    lower = s.lower()
    plan_idx = lower.find("plan:")
    code_idx = lower.find("code:")

    if plan_idx != -1 and code_idx != -1 and plan_idx < code_idx:
        plan_part = s[plan_idx + len("plan:") : code_idx].strip()
        code_part = s[code_idx + len("code:") :].strip()
        return Extracted(plan_raw=plan_part, code_raw=strip_markdown_fences(code_part))

    # fallback: locate fenced code block
    fence_start = lower.find("```")
    if fence_start != -1:
        fence_end = lower.find("```", fence_start + 3)
        if fence_end != -1:
            code_block = s[fence_start:fence_end + 3]
            return Extracted(plan_raw="", code_raw=strip_markdown_fences(code_block))

    # last resort: treat entire output as code
    return Extracted(plan_raw="", code_raw=strip_markdown_fences(s))


def parse_plan_json(plan_raw: str) -> Tuple[Optional[Dict[str, Any]], str]:
    """
    Return (plan_obj, plan_str_for_output).
    If JSON parse fails, plan_obj=None and plan_str_for_output is the original trimmed string.
    """

    raw = (plan_raw or "").strip()
    if not raw:
        return None, ""
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError:
        return None, raw
    if isinstance(obj, dict):
        return obj, raw
    return None, raw


def build_user_prompt(prompt: Dict[str, Any], api_context_lines: List[str]) -> str:
    task = str(prompt.get("task", "")).strip()
    constraints = prompt.get("constraints") or []
    must_use = prompt.get("must_use_apis") or []
    eval_hints = prompt.get("eval_hints") or []

    parts: List[str] = []
    parts.append("[Task]")
    parts.append(task if task else "(empty)")
    parts.append("")

    if constraints:
        parts.append("[Constraints]")
        for c in constraints:
            parts.append(f"- {c}")
        parts.append("")

    if must_use:
        parts.append("[Must Use APIs]")
        for a in must_use:
            parts.append(f"- {a}")
        parts.append("")

    if eval_hints:
        parts.append("[Eval Hints]")
        for h in eval_hints:
            parts.append(f"- {h}")
        parts.append("")

    if api_context_lines:
        parts.append("[Relevant Phaser APIs]")
        for i, ln in enumerate(api_context_lines, 1):
            parts.append(f"{i}) {ln}")
        parts.append("")

    parts.append("[Output Format]")
    parts.append("plan:")
    parts.append('{"requirements":[...],"apis":[...],"steps":[...],"notes":"..."}')
    parts.append("code:")
    parts.append("// pure JavaScript code only; no markdown fences; no extra explanations")

    return "\n".join(parts).strip() + "\n"


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)

