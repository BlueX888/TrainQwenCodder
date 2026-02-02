#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

from common import iter_jsonl, write_jsonl


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def choose_quality(rng: random.Random) -> str:
    r = rng.random()
    if r < 0.06:
        return "parse_fail"
    if r < 0.12:
        return "unsafe"
    if r < 0.20:
        return "missing_game"
    if r < 0.28:
        return "missing_scene"
    if r < 0.36:
        return "lint_fail"
    if r < 0.44:
        return "must_use_miss"
    if r < 0.52:
        return "api_miss"
    if r < 0.58:
        return "runtime_crash"
    return "good"


def make_plan_block(prompt: Dict[str, Any], variant: int) -> str:
    task = str(prompt.get("task", "")).strip()
    must_use = prompt.get("must_use_apis") or []
    must_use = [str(x) for x in must_use if x]
    steps = [
        "1. preload: 准备（不依赖外部资源）",
        "2. create: 创建对象与交互",
    ]
    if rng_bool(prompt, variant, p=0.45):
        steps.append("3. update: 更新运动/状态（如需要）")

    return "\n".join(
        [
            "[PLAN]",
            f"REQ: {task}" if task else "REQ: ",
            "API: " + ", ".join(must_use) if must_use else "API: ",
            "STEPS:",
            *steps,
            "[/PLAN]",
        ]
    )


def rng_bool(prompt: Dict[str, Any], variant: int, p: float) -> bool:
    # deterministic-ish helper: mix prompt_id + variant
    pid = str(prompt.get("id", "")).strip()
    seed = sum(ord(c) for c in (pid + str(variant))) % 1000
    return (seed / 1000.0) < float(p)


def code_skeleton(prompt: Dict[str, Any], rng: random.Random, quality: str) -> str:
    must_use = prompt.get("must_use_apis") or []
    must_use = [str(x) for x in must_use if x]

    w = rng.choice([320, 480, 800])
    h = rng.choice([240, 320, 600])
    color = rng.choice([0x22CCFF, 0xAA66FF, 0xFFCC22, 0x66FF66])

    need_physics = any(m.startswith("Phaser.Physics.Arcade.") for m in must_use)
    need_tilemap = any(m == "Phaser.Tilemaps.Tilemap" for m in must_use)
    need_rnd = any(m == "Phaser.Math.RND" for m in must_use)
    need_drag = any(m == "Phaser.Input.Events.GAMEOBJECT_DRAG" for m in must_use)
    need_move = any(m == "Phaser.Input.Events.POINTER_MOVE" for m in must_use)
    need_scene_class = any(m == "Phaser.Scene" for m in must_use)

    drop = must_use[0] if (quality == "must_use_miss" and must_use) else None

    lines: List[str] = []
    if quality == "unsafe":
        lines.append("const fs = require('fs');")
    if quality == "lint_fail":
        lines.append("window.__lint_fail = 1;")

    if need_scene_class and drop != "Phaser.Scene":
        lines.append("class MainScene extends Phaser.Scene {")
        lines.append("  constructor() { super({ key: 'main' }); }")
        lines.append("  preload() { /* no external assets */ }")
        lines.append("  create() {")
    else:
        lines.append("const scene = {")
        lines.append("  preload() {")
        lines.append("    // no external assets")
        lines.append("  },")
        lines.append("  create() {")

    lines.append("    const tex = this.add.graphics();")
    lines.append("    tex.fillStyle(0xffffff, 1);")
    lines.append("    tex.fillRect(0, 0, 2, 2);")
    lines.append("    tex.generateTexture('__px', 2, 2);")
    lines.append("    tex.destroy();")

    if drop != "Phaser.GameObjects.Graphics":
        lines.append("    const g = this.add.graphics();")
        lines.append(f"    g.fillStyle({color}, 1);")
        lines.append("    g.fillRect(20, 20, 60, 60);")

    if need_rnd and drop != "Phaser.Math.RND":
        lines.append("    const r = Phaser.Math.RND.integerInRange(10, 80);")
        lines.append("    this.__rnd = r;")

    if any(m == "Phaser.GameObjects.Text" for m in must_use) and drop != "Phaser.GameObjects.Text":
        lines.append("    let count = 0;")
        lines.append("    const t = this.add.text(10, 10, 'count: 0');")
        lines.append("    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {")
        lines.append("      count += 1;")
        lines.append("      t.setText('count: ' + count);")
        lines.append("    });")

    if any(m == "Phaser.Input.Keyboard.KeyCodes" for m in must_use) and drop != "Phaser.Input.Keyboard.KeyCodes":
        lines.append("    const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);")
        lines.append("    key.on('down', () => {});")

    if any(m == "Phaser.Tweens.Tween" for m in must_use) and drop != "Phaser.Tweens.Tween":
        lines.append("    this.tweens.add({ targets: g, alpha: 0.2, yoyo: true, repeat: -1, duration: 300 });")

    if any(m == "Phaser.Cameras.Scene2D.Camera" for m in must_use) and drop != "Phaser.Cameras.Scene2D.Camera":
        lines.append("    const cam = this.cameras.main;")
        lines.append("    cam.setBackgroundColor('#222');")

    if any(m == "Phaser.GameObjects.Particles.ParticleEmitterManager" for m in must_use) and drop != "Phaser.GameObjects.Particles.ParticleEmitterManager":
        lines.append("    this.add.particles(0, 0, '__px', { speed: 20, lifespan: 300, quantity: 1 });")

    if need_physics:
        if any(m == "Phaser.Physics.Arcade.Group" for m in must_use) and drop != "Phaser.Physics.Arcade.Group":
            lines.append("    this.physics.add.group();")
        if any(m == "Phaser.Physics.Arcade.Sprite" for m in must_use) and drop != "Phaser.Physics.Arcade.Sprite":
            lines.append("    this.physics.add.sprite(100, 100, '__px');")

    if need_tilemap and drop != "Phaser.Tilemaps.Tilemap":
        lines.append("    this.make.tilemap({ data: [[0, 0], [0, 0]], tileWidth: 16, tileHeight: 16 });")

    if need_drag and drop != "Phaser.Input.Events.GAMEOBJECT_DRAG":
        lines.append("    const r0 = this.add.rectangle(120, 120, 50, 50, 0x00ffff).setInteractive();")
        lines.append("    this.input.setDraggable(r0);")
        lines.append("    this.input.on(Phaser.Input.Events.GAMEOBJECT_DRAG, (p, obj, dx, dy) => {")
        lines.append("      obj.x = dx;")
        lines.append("      obj.y = dy;")
        lines.append("    });")

    if need_move and drop != "Phaser.Input.Events.POINTER_MOVE":
        lines.append("    this.input.on(Phaser.Input.Events.POINTER_MOVE, () => {});")

    if quality == "api_miss":
        lines.append("    this.add.grahpics();")

    if quality == "runtime_crash":
        lines.append("    throw new Error('mock_runtime_crash');")

    lines.append("  }")
    if need_scene_class and drop != "Phaser.Scene":
        lines.append("  update() {}")
        lines.append("}")
    else:
        lines.append("  update() {}")
        lines.append("};")

    if quality == "missing_scene":
        lines = [ln for ln in lines if not ln.startswith("const scene =") and not ln.startswith("class MainScene")]

    lines.append("const config = {")
    lines.append("  type: Phaser.HEADLESS,")
    lines.append(f"  width: {w},")
    lines.append(f"  height: {h},")
    if need_physics:
        lines.append("  physics: { default: 'arcade', arcade: { gravity: { y: 200 }, debug: false } },")
    if quality != "missing_scene":
        if need_scene_class and drop != "Phaser.Scene":
            lines.append("  scene: MainScene,")
        else:
            lines.append("  scene,")
    lines.append("};")

    if quality == "missing_game":
        return "\n".join(lines)

    lines.append("new Phaser.Game(config);")

    if quality == "parse_fail":
        return "\n".join(lines) + "\nif ("

    return "\n".join(lines)


def build_text(prompt: Dict[str, Any], rng: random.Random, variant: int, quality: str) -> Tuple[str, Dict[str, Any]]:
    # Mostly mimic stage1 format: [PLAN] + fenced code.
    plan = make_plan_block(prompt, variant=variant)
    code = code_skeleton(prompt, rng=rng, quality=quality)
    text = plan + "\n\n```javascript\n" + code + "\n```\n"
    return text, {"quality": quality, "variant": variant}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompts", default=str(repo_root() / "stage2/data/grpo/prompts_train.jsonl"))
    ap.add_argument("--out", default=str(repo_root() / "stage2/data/grpo/rollouts/mock_step0001.jsonl"))
    ap.add_argument("--step", type=int, default=1)
    ap.add_argument("--num-prompts", type=int, default=8)
    ap.add_argument("--group-size", type=int, default=8)
    ap.add_argument("--seed", type=int, default=2026)
    args = ap.parse_args()

    prompts_path = Path(args.prompts)
    if not prompts_path.exists():
        raise SystemExit(f"prompts not found: {prompts_path}")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    rng = random.Random(int(args.seed))
    now = datetime.now(timezone.utc).isoformat()

    prompts = list(iter_jsonl(prompts_path))
    rng.shuffle(prompts)
    prompts = prompts[: max(1, int(args.num_prompts))]

    g = max(1, int(args.group_size))
    decode_cfg = {"temperature": 0.7, "top_p": 0.9, "max_new_tokens": 1800}

    rows: List[Dict[str, Any]] = []
    for p in prompts:
        pid = str(p.get("id", "")).strip()
        if not pid:
            continue
        # Encourage at least one good sample often.
        good_idx = rng.randrange(g) if rng.random() < 0.7 else -1
        for group_id in range(g):
            quality = "good" if group_id == good_idx else choose_quality(rng)
            text, dbg = build_text(p, rng=rng, variant=group_id, quality=quality)
            rows.append(
                {
                    "step": int(args.step),
                    "prompt_id": pid,
                    "group_id": int(group_id),
                    "text": text,
                    "meta": {"created_at": now, "decode": decode_cfg, **dbg},
                }
            )

    write_jsonl(out_path, rows)
    print(f"Wrote rollouts={len(rows)} -> {out_path}")


if __name__ == "__main__":
    main()

