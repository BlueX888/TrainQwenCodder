#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from common import iter_jsonl, write_jsonl


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def make_mock_output(req: Dict[str, Any], rng: random.Random) -> str:
    prompt = req.get("prompt") or {}
    task = str(prompt.get("task", "")).strip()
    must_use = prompt.get("must_use_apis") or []
    must_use = [str(x) for x in must_use if x]

    apis = must_use[:]
    steps = ["preload: prepare assets (no external files)", "create: build scene objects and interactions"]
    plan = {
        "requirements": [task] if task else [],
        "apis": apis,
        "steps": steps,
        "notes": "mock teacher output for pipeline testing",
    }

    # A small skeleton that tries to satisfy common must_use patterns used by prompt seeds.
    w = rng.choice([320, 480, 800])
    h = rng.choice([240, 320, 600])
    color = rng.choice([0xff0000, 0x00ff00, 0x0000ff, 0xffff00])

    # Try to include a common must-use event if present.
    event_const = None
    for m in must_use:
        if m.startswith("Phaser.Input.Events."):
            event_const = m
            break

    need_physics = any(m.startswith("Phaser.Physics.Arcade.") for m in must_use)

    lines: List[str] = []
    lines.append("const config = {")
    lines.append("  type: Phaser.HEADLESS,")
    lines.append(f"  width: {w},")
    lines.append(f"  height: {h},")
    if need_physics:
        lines.append("  physics: { default: 'arcade', arcade: { gravity: { y: 300 }, debug: false } },")
    lines.append("  scene: {")
    lines.append("    preload() {")
    lines.append("      // no external assets")
    lines.append("    },")
    lines.append("    create() {")
    lines.append("      const g = this.add.graphics();")
    lines.append(f"      g.fillStyle({color}, 1);")
    lines.append("      g.fillRect(20, 20, 60, 60);")

    if any(m == "Phaser.GameObjects.Text" for m in must_use):
        lines.append("      this.add.text(10, 10, 'score: 0');")

    if any(m == "Phaser.Cameras.Scene2D.Camera" for m in must_use):
        lines.append("      const cam = this.cameras.main;")
        lines.append("      cam.setBackgroundColor('#222');")

    if any(m == "Phaser.Tweens.Tween" for m in must_use):
        lines.append("      this.tweens.add({ targets: g, alpha: 0.2, yoyo: true, repeat: -1, duration: 400 });")

    if any(m == "Phaser.GameObjects.Particles.ParticleEmitterManager" for m in must_use):
        lines.append("      // NOTE: mock-only; may not run without a texture, but is useful for AST/API validation.")
        lines.append("      this.add.particles(0, 0, '__pt', { speed: 10, lifespan: 300, quantity: 1 });")

    if any(m == "Phaser.Physics.Arcade.Group" for m in must_use):
        lines.append("      this.physics.add.group();")

    if any(m == "Phaser.Physics.Arcade.Sprite" for m in must_use):
        lines.append("      // NOTE: mock-only; sprite key may not exist in runtime, but passes AST/API checks.")
        lines.append("      this.physics.add.sprite(100, 100, '__spr');")

    if any(m == "Phaser.Input.Keyboard.KeyCodes" for m in must_use):
        lines.append("      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);")

    if event_const:
        lines.append(f"      this.input.on({event_const}, () => {{}});")
    else:
        lines.append("      this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {});")
    lines.append("    }")
    lines.append("  }")
    lines.append("};")
    lines.append("new Phaser.Game(config);")

    code = "\n".join(lines)

    return "plan:\n" + json.dumps(plan, ensure_ascii=False) + "\ncode:\n" + code + "\n"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--requests", default=str(repo_root() / "stage1/data/sft_distill/requests.jsonl"))
    ap.add_argument("--out", default=str(repo_root() / "stage1/data/sft_distill/raw_outputs.jsonl"))
    ap.add_argument("--seed", type=int, default=2025)
    args = ap.parse_args()

    req_path = Path(args.requests)
    out_path = Path(args.out)
    if not req_path.exists():
        raise SystemExit(f"requests not found: {req_path}")

    rng = random.Random(int(args.seed))
    now = datetime.now(timezone.utc).isoformat()

    rows: List[Dict[str, Any]] = []
    for req in iter_jsonl(req_path):
        rows.append(
            {
                "request_id": req.get("request_id", ""),
                "teacher_model": "mock",
                "finish_reason": "stop",
                "text": make_mock_output(req, rng),
                "created_at": now,
            }
        )

    write_jsonl(out_path, rows)
    print(f"Wrote {len(rows)} raw outputs -> {out_path}")


if __name__ == "__main__":
    main()
