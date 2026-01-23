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


def make_plan(prompt: Dict[str, Any], rng: random.Random, variant: int) -> Dict[str, Any]:
    task = str(prompt.get("task", "")).strip()
    must_use = prompt.get("must_use_apis") or []
    must_use = [str(x) for x in must_use if x]
    steps = [
        "preload: prepare assets (no external files)",
        "create: build scene objects and interactions",
    ]
    return {
        "requirements": [task] if task else [],
        "apis": must_use[:],
        "steps": steps,
        "notes": f"mock eval variant={variant}",
    }


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


def code_skeleton(prompt: Dict[str, Any], rng: random.Random, quality: str) -> str:
    must_use = prompt.get("must_use_apis") or []
    must_use = [str(x) for x in must_use if x]

    w = rng.choice([320, 480, 800])
    h = rng.choice([240, 320, 600])
    color = rng.choice([0x22ccff, 0xaa66ff, 0xffcc22, 0x66ff66])

    need_physics = any(m.startswith("Phaser.Physics.Arcade.") for m in must_use)
    need_tilemap = any(m == "Phaser.Tilemaps.Tilemap" for m in must_use)
    need_rnd = any(m == "Phaser.Math.RND" for m in must_use)
    need_drag = any(m == "Phaser.Input.Events.GAMEOBJECT_DRAG" for m in must_use)
    need_move = any(m == "Phaser.Input.Events.POINTER_MOVE" for m in must_use)
    need_scene_class = any(m == "Phaser.Scene" for m in must_use)

    # In must_use_miss mode, drop the first must-use feature.
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

    # Optional tiny texture for particles.
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
        # Typo to force API miss: Phaser.GameObjects.GameObjectFactory#grahpics (not exists)
        lines.append("    this.add.grahpics();")

    if quality == "runtime_crash":
        lines.append("    throw new Error('mock_runtime_crash');")

    lines.append("  }")
    if need_scene_class and drop != "Phaser.Scene":
        lines.append("}")
    else:
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
        # break syntax on purpose
        return "\n".join(lines) + "\nif ("

    return "\n".join(lines)


def build_text(prompt: Dict[str, Any], rng: random.Random, variant: int, quality: str) -> Tuple[str, Dict[str, Any]]:
    if rng.random() < 0.12:
        plan_text = '{"requirements": [}'
        plan_obj = None
    else:
        plan_obj = make_plan(prompt, rng, variant)
        plan_text = json.dumps(plan_obj, ensure_ascii=False)
    code = code_skeleton(prompt, rng, quality=quality)
    text = "plan:\n" + plan_text + "\ncode:\n" + code + "\n"
    return text, {"plan_obj": plan_obj, "quality": quality}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompts", default=str(repo_root() / "stage3/data/eval/prompts_eval_300.jsonl"))
    ap.add_argument("--out-dir", default=str(repo_root() / "stage3/data/eval/generations/mock_model"))
    ap.add_argument("--k", type=int, default=8)
    ap.add_argument("--seed", type=int, default=2026)
    args = ap.parse_args()

    prompts_path = Path(args.prompts)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    if not prompts_path.exists():
        raise SystemExit(f"prompts not found: {prompts_path}")

    rng = random.Random(int(args.seed))
    now = datetime.now(timezone.utc).isoformat()
    k = max(1, int(args.k))

    decode_cfg = {"temperature": 0.7, "top_p": 0.9, "max_new_tokens": 1800}

    pass1_rows: List[Dict[str, Any]] = []
    pass8_rows: List[Dict[str, Any]] = []

    for prompt in iter_jsonl(prompts_path):
        prompt_id = str(prompt.get("id", "")).strip()
        if not prompt_id:
            continue

        # Pass@8: encourage at least one good sample sometimes.
        force_good = rng.random() < 0.7
        good_idx = rng.randrange(k) if force_good else -1

        for sample_id in range(k):
            quality = "good" if sample_id == good_idx else choose_quality(rng)
            text, dbg = build_text(prompt, rng, variant=sample_id, quality=quality)
            row = {
                "prompt_id": prompt_id,
                "sample_id": sample_id,
                "seed": int(args.seed) + sample_id,
                "text": text,
                "meta": {"created_at": now, "decode": decode_cfg, **dbg},
            }
            pass8_rows.append(row)
            if sample_id == 0:
                pass1_rows.append(row)

    write_jsonl(out_dir / "gen_pass1.jsonl", pass1_rows)
    write_jsonl(out_dir / "gen_pass8.jsonl", pass8_rows)
    print(f"Wrote pass1={len(pass1_rows)} pass8={len(pass8_rows)} -> {out_dir}")


if __name__ == "__main__":
    main()

