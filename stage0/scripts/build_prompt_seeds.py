#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import csv
import json
import random
from collections import Counter, defaultdict
from pathlib import Path
from typing import Dict, List, Set, Tuple


def make_seed(
    *,
    seed_id: str,
    difficulty: str,
    modules: List[str],
    task: str,
    constraints: List[str],
    must_use_apis: List[str],
    eval_hints: List[str],
    tags: List[str],
    notes: str = "",
) -> dict:
    return {
        "id": seed_id,
        "difficulty": difficulty,
        "modules": modules,
        "task": task,
        "constraints": constraints,
        "must_use_apis": must_use_apis,
        "eval_hints": eval_hints,
        "tags": tags,
        "notes": notes,
    }


def default_constraints(difficulty: str) -> List[str]:
    base = [
        "使用 Phaser3",
        "不得依赖外部资源（优先用 Graphics/内置形状/纯色纹理）",
        "必须包含 preload/create 生命周期",
        "输出代码需可独立运行（包含 Phaser.Game 配置与 Scene）",
    ]
    if difficulty in ("medium", "hard"):
        base.append("需要包含可验证的状态信号（例如 score/health/level 等变量）")
    if difficulty == "hard":
        base.append("尽量保持行为确定性（固定随机种子或可配置 seed）")
    return base


def gen_easy(rng: random.Random, variant: int) -> Tuple[List[str], str, List[str], List[str], List[str]]:
    shapes = ["方块", "圆形", "三角形", "六边形"]
    colors = ["红色", "绿色", "蓝色", "黄色", "紫色", "青色"]
    speed = rng.choice([120, 160, 200, 240])
    shape = rng.choice(shapes)
    color = rng.choice(colors)

    patterns = [
        (
            ["Scene", "GameObjects", "Input"],
            f"实现一个可拖拽的{color}{shape}，拖拽时改变颜色，松手后回到初始位置。",
            ["Phaser.Input.Events.GAMEOBJECT_DRAG", "Phaser.GameObjects.Graphics"],
            ["应启用交互并监听拖拽事件", "拖拽过程中位置应跟随指针", "松手后回到初始坐标"],
            ["drag", "graphics", "input"],
        ),
        (
            ["Scene", "GameObjects", "Input"],
            f"实现点击画面生成{shape}的功能：每次点击生成一个随机颜色的{shape}，并在屏幕边界内随机初始位置。",
            ["Phaser.Input.Events.POINTER_DOWN", "Phaser.GameObjects.Graphics"],
            ["应监听 pointerdown", "每次点击新增一个对象", "对象位置需在边界内"],
            ["spawn", "pointer", "graphics"],
        ),
        (
            ["Scene", "GameObjects", "Input"],
            f"实现键盘方向键控制一个{color}{shape}移动，移动速度为 {speed}，并限制在画布边界内。",
            ["Phaser.Input.Keyboard.KeyCodes", "Phaser.GameObjects.Graphics"],
            ["应创建键盘输入", "对象位置随按键变化", "对象不能移出边界"],
            ["keyboard", "movement", "bounds"],
        ),
        (
            ["Scene", "Animations"],
            f"实现一个补间动画：让一个{color}{shape}在 2 秒内从左移动到右，然后往返循环。",
            ["Phaser.Tweens.Tween", "Phaser.GameObjects.Graphics"],
            ["应创建 tween", "对象应左右往返移动", "动画应循环"],
            ["tween", "loop", "motion"],
        ),
        (
            ["Scene", "Camera"],
            f"实现相机跟随：让一个自动水平移动的{shape}在场景中移动，相机跟随该对象并保持居中。",
            ["Phaser.Cameras.Scene2D.Camera", "Phaser.GameObjects.Graphics"],
            ["应创建可移动目标", "相机应 startFollow 目标", "目标移动时相机保持跟随"],
            ["camera", "follow", "motion"],
        ),
        (
            ["Scene", "GameObjects", "Input"],
            f"实现一个计数器 UI：每次点击画面，计数 +1，并在屏幕左上角显示当前计数。",
            ["Phaser.Input.Events.POINTER_DOWN", "Phaser.GameObjects.Text"],
            ["应监听 pointerdown", "计数变量递增", "Text 内容实时更新"],
            ["ui", "text", "counter"],
        ),
        (
            ["Scene", "Particles", "Input"],
            "实现一个粒子跟随效果：指针移动时在指针位置发射粒子拖尾（不得依赖外部贴图，需程序化生成一个小纹理）。",
            ["Phaser.GameObjects.Particles.ParticleEmitterManager", "Phaser.Input.Events.POINTER_MOVE"],
            ["应监听 pointermove", "应创建粒子发射器", "粒子应随指针产生拖尾效果"],
            ["particles", "trail", "pointer"],
        ),
    ]

    modules, task, apis, hints, tags = rng.choice(patterns)
    # small variant to reduce duplicates
    task = task + ("" if variant % 3 else "（不得使用外部图片资源）")
    return modules, task, apis, hints, tags


def gen_medium(rng: random.Random, variant: int) -> Tuple[List[str], str, List[str], List[str], List[str]]:
    speed = rng.choice([160, 200, 240])
    gravity = rng.choice([300, 500, 800])
    coin_count = rng.choice([5, 8, 12])

    patterns = [
        (
            ["Scene", "Physics", "Input"],
            f"实现一个简易平台跳跃：角色可左右移动与跳跃，重力为 {gravity}，并与地面碰撞不穿透。",
            ["Phaser.Physics.Arcade.Sprite", "Phaser.Input.Keyboard.KeyCodes"],
            ["应启用 Arcade Physics", "角色受重力影响并可跳跃", "角色与地面应发生碰撞并阻止穿透"],
            ["platformer", "arcade", "jump"],
        ),
        (
            ["Scene", "Physics", "GameObjects"],
            f"实现收集物品玩法：场景中生成 {coin_count} 个可收集物体，玩家碰到后消失并加分，显示 score。",
            ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
            ["应生成多个可收集对象", "发生 overlap 后对象销毁/禁用", "score 变量与 Text 同步更新"],
            ["collect", "score", "overlap"],
        ),
        (
            ["Scene", "Physics", "Input"],
            f"实现一个发射子弹的例子：按空格发射子弹（对象池复用），子弹速度 {speed}，离开边界回收。",
            ["Phaser.Physics.Arcade.Group", "Phaser.Input.Keyboard.KeyCodes"],
            ["应使用 group 作为对象池", "按键触发生成/复用子弹", "子弹离开边界应回收"],
            ["shoot", "pool", "keyboard"],
        ),
        (
            ["Scene", "Animations", "Input"],
            "实现一个角色状态切换：按下不同按键切换 idle/run 两种状态，并通过 tween 或帧动画体现差异。",
            ["Phaser.Tweens.Tween", "Phaser.Input.Keyboard.KeyCodes"],
            ["应维护 state 变量", "不同状态触发不同动画/运动", "状态切换应可重复触发且稳定"],
            ["state", "animation", "input"],
        ),
        (
            ["Scene", "Camera", "Physics"],
            "实现一个追踪镜头与震屏：玩家与敌人碰撞时触发 camera shake，并扣减生命值显示。",
            ["Phaser.Cameras.Scene2D.Camera", "Phaser.Physics.Arcade.Sprite"],
            ["应维护 health 变量", "碰撞事件触发 health 变化", "碰撞时应触发相机 shake"],
            ["camera", "shake", "health"],
        ),
        (
            ["Scene", "Tilemap", "Input", "Physics"],
            "实现一个基于数组数据的简单 Tilemap：用 0/1 数组生成网格地图（1 为墙可碰撞），玩家用方向键移动且不能穿墙。",
            ["Phaser.Tilemaps.Tilemap", "Phaser.Physics.Arcade.Sprite"],
            ["应从数组数据生成 tilemap/layer", "墙体应具有碰撞", "玩家移动时不能穿墙"],
            ["tilemap", "collision", "grid"],
        ),
    ]

    modules, task, apis, hints, tags = rng.choice(patterns)
    if variant % 4 == 0:
        task += "（要求：不要使用外部图片资源，尽量用 Graphics 或纯色纹理）"
    return modules, task, apis, hints, tags


def gen_hard(rng: random.Random, variant: int) -> Tuple[List[str], str, List[str], List[str], List[str]]:
    levels = rng.choice([3, 5])
    seed = rng.randint(1, 9999)

    patterns = [
        (
            ["Scene", "GameObjects"],
            f"实现双场景流程：LoadingScene 预加载资源（可用程序化生成纹理代替图片），然后切换到 MainScene 并显示提示文字。",
            ["Phaser.Scene", "Phaser.GameObjects.Text"],
            ["应包含至少两个 Scene", "应从 LoadingScene 切换到 MainScene", "MainScene 应显示文本或可见 UI 信号"],
            ["scene", "loading", "flow"],
        ),
        (
            ["Scene", "Physics", "Input", "GameObjects"],
            f"实现一个带关卡的收集玩法：共 {levels} 关，每关收集完物品后进入下一关，显示 level 与 score。",
            ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
            ["应维护 level/score 状态", "收集完触发下一关重置布局", "UI 应正确显示当前 level 与 score"],
            ["level", "progress", "score"],
        ),
        (
            ["Scene", "Physics"],
            f"实现确定性生成：基于 seed={seed} 生成一批障碍物布局，要求相同 seed 下布局一致，并能在 UI 显示当前 seed。",
            ["Phaser.Math.RND", "Phaser.GameObjects.Text"],
            ["应提供可配置 seed", "相同 seed 下生成布局一致", "应显示 seed 值用于验证"],
            ["seed", "deterministic", "layout"],
        ),
        (
            ["Scene", "Physics"],
            "实现对象池 + 压力测试：持续生成/回收一定数量的子弹或粒子对象，要求使用对象池避免无限增长，并输出当前活动对象数量。",
            ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
            ["应使用对象池复用实例", "活动对象数量应有上限", "UI 输出当前活动数量用于验证"],
            ["pool", "stress", "metrics"],
        ),
    ]

    modules, task, apis, hints, tags = rng.choice(patterns)
    if variant % 2 == 0:
        task += "（要求：输出可验证的 signals，例如 window.__signals__ 或日志 JSON）"
    return modules, task, apis, hints, tags


def write_jsonl(path: Path, rows: List[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def write_report_json(path: Path, rows: List[dict]) -> None:
    by_diff = Counter(r["difficulty"] for r in rows)
    by_module = Counter()
    for r in rows:
        for m in r.get("modules", []):
            by_module[m] += 1
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            {
                "total": len(rows),
                "by_difficulty": dict(by_diff),
                "by_module": dict(by_module),
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def write_coverage_csv(path: Path, rows: List[dict]) -> None:
    table: Dict[str, Counter] = defaultdict(Counter)
    for r in rows:
        diff = r["difficulty"]
        for m in r.get("modules", []):
            table[m][diff] += 1
            table[m]["total"] += 1

    path.parent.mkdir(parents=True, exist_ok=True)
    diffs = ["easy", "medium", "hard", "total"]
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["module"] + diffs)
        for module in sorted(table.keys()):
            row = [module] + [table[module].get(d, 0) for d in diffs]
            w.writerow(row)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="data/prompt_seeds/prompt_seeds.jsonl")
    ap.add_argument("--count", type=int, default=2000)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--report-json", default="data/reports/prompt_seeds_report.json")
    ap.add_argument("--coverage-csv", default="data/reports/prompt_coverage.csv")
    args = ap.parse_args()

    n = max(1, int(args.count))
    n_easy = int(round(n * 0.4))
    n_medium = int(round(n * 0.4))
    n_hard = n - n_easy - n_medium

    rng = random.Random(args.seed)

    rows: List[dict] = []
    seen: Set[str] = set()

    def add_row(difficulty: str, variant: int) -> None:
        if difficulty == "easy":
            modules, task, apis, hints, tags = gen_easy(rng, variant)
        elif difficulty == "medium":
            modules, task, apis, hints, tags = gen_medium(rng, variant)
        else:
            modules, task, apis, hints, tags = gen_hard(rng, variant)

        constraints = default_constraints(difficulty)

        # de-dup key: task + modules + difficulty
        key = f"{difficulty}|{','.join(modules)}|{task}"
        if key in seen:
            return
        seen.add(key)

        seed_id = f"seed_{len(rows)+1:06d}"
        rows.append(
            make_seed(
                seed_id=seed_id,
                difficulty=difficulty,
                modules=modules,
                task=task,
                constraints=constraints,
                must_use_apis=apis,
                eval_hints=hints,
                tags=tags,
            )
        )

    target = [("easy", n_easy), ("medium", n_medium), ("hard", n_hard)]
    for diff, cnt in target:
        variant = 0
        # retry loop to satisfy de-dup while keeping deterministic-ish
        while sum(1 for r in rows if r["difficulty"] == diff) < cnt:
            add_row(diff, variant)
            variant += 1
            if variant > cnt * 50:
                raise SystemExit(f"Failed to generate enough unique prompts for {diff}.")

    # stable ordering by id (already appended)
    out_path = Path(args.out)
    write_jsonl(out_path, rows)

    write_report_json(Path(args.report_json), rows)
    write_coverage_csv(Path(args.coverage_csv), rows)

    print(f"Wrote {len(rows)} prompts -> {out_path}")


if __name__ == "__main__":
    main()
