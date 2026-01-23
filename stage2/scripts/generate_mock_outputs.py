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


def make_plan(prompt: Dict[str, Any], variant: int, rng: random.Random) -> Dict[str, Any]:
    task = str(prompt.get("task", "")).strip()
    must_use = prompt.get("must_use_apis") or []
    must_use = [str(x) for x in must_use if x]
    # Mix must_use with a couple of generic APIs.
    apis = must_use[:]
    if "Phaser.Input.Events.POINTER_DOWN" not in apis and rng.random() < 0.4:
        apis.append("Phaser.Input.Events.POINTER_DOWN")
    steps = ["preload: prepare assets (no external files)", "create: build scene objects and interactions"]
    if str(prompt.get("difficulty", "")).lower().strip() == "hard":
        steps.append("update: maintain state each frame if needed")
    return {
        "requirements": [task] if task else [],
        "apis": apis,
        "steps": steps,
        "notes": f"mock rollout variant={variant}",
    }


def code_skeleton(prompt: Dict[str, Any], rng: random.Random, quality: str) -> str:
    must_use = prompt.get("must_use_apis") or []
    must_use = [str(x) for x in must_use if x]

    w = rng.choice([320, 480, 800])
    h = rng.choice([240, 320, 600])
    color = rng.choice([0xff0000, 0x00ff00, 0x0000ff, 0xffff00])

    need_physics = any(m.startswith("Phaser.Physics.Arcade.") for m in must_use)

    lines: List[str] = []
    if quality == "unsafe":
        lines.append("const fs = require('fs');")

    lines.append("const config = {")
    lines.append("  type: Phaser.HEADLESS,")
    lines.append(f"  width: {w},")
    lines.append(f"  height: {h},")
    if need_physics:
        lines.append("  physics: { default: 'arcade', arcade: { gravity: { y: 300 }, debug: false } },")

    if quality == "missing_scene":
        # Intentionally omit scene
        lines.append("};")
        lines.append("new Phaser.Game(config);")
        return "\n".join(lines)

    lines.append("  scene: {")
    if quality != "missing_preload":
        lines.append("    preload() {")
        lines.append("      // no external assets")
        lines.append("    },")

    if quality != "missing_create":
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
            lines.append("      this.add.particles(0, 0, '__pt', { speed: 10, lifespan: 300, quantity: 1 });")

        if any(m == "Phaser.Physics.Arcade.Group" for m in must_use):
            lines.append("      this.physics.add.group();")

        if any(m == "Phaser.Physics.Arcade.Sprite" for m in must_use):
            lines.append("      this.physics.add.sprite(100, 100, '__spr');")

        if any(m == "Phaser.Input.Keyboard.KeyCodes" for m in must_use):
            lines.append("      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);")

        # Always add one interaction
        lines.append("      this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {});")
        lines.append("    }")
    lines.append("  }")
    lines.append("};")

    if quality == "missing_game":
        return "\n".join(lines)

    lines.append("new Phaser.Game(config);")
    return "\n".join(lines)


def choose_quality(rng: random.Random) -> str:
    r = rng.random()
    if r < 0.08:
        return "unsafe"
    if r < 0.16:
        return "missing_game"
    if r < 0.24:
        return "missing_scene"
    if r < 0.32:
        return "missing_preload"
    if r < 0.40:
        return "missing_create"
    return "good"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompts", default=str(repo_root() / "stage2/data/grpo/prompts_train.jsonl"))
    ap.add_argument("--out", default=str(repo_root() / "stage2/data/grpo/mock_outputs.jsonl"))
    ap.add_argument("--group-size", type=int, default=8)
    ap.add_argument("--seed", type=int, default=2025)
    args = ap.parse_args()

    prompts_path = Path(args.prompts)
    out_path = Path(args.out)
    if not prompts_path.exists():
        raise SystemExit(f"prompts not found: {prompts_path}")

    rng = random.Random(int(args.seed))
    now = datetime.now(timezone.utc).isoformat()
    group_size = max(1, int(args.group_size))

    rows: List[Dict[str, Any]] = []
    for prompt in iter_jsonl(prompts_path):
        prompt_id = str(prompt.get("id", "")).strip()
        for g in range(group_size):
            quality = choose_quality(rng)
            if rng.random() < 0.12:
                # sometimes break plan json
                plan_text = '{"requirements": [}'
                plan_obj = None
            else:
                plan_obj = make_plan(prompt, g, rng)
                plan_text = json.dumps(plan_obj, ensure_ascii=False)

            code = code_skeleton(prompt, rng, quality=quality)
            text = "plan:\n" + plan_text + "\ncode:\n" + code + "\n"

            rows.append(
                {
                    "prompt_id": prompt_id,
                    "group_id": g,
                    "text": text,
                    "meta": {"created_at": now, "quality": quality, "seed": int(args.seed)},
                }
            )

    write_jsonl(out_path, rows)
    print(f"Wrote {len(rows)} outputs -> {out_path}")


if __name__ == "__main__":
    main()

