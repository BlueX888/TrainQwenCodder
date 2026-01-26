#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Prompt 种子库生成器 - 扩展版
目标：生成 2000+ 条覆盖 Phaser3 各模块的高质量 Prompt
"""

import argparse
import csv
import json
import random
from collections import Counter, defaultdict
from itertools import product
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


# ============ 参数化维度 ============
SHAPES = ["方块", "圆形", "三角形", "六边形", "矩形", "椭圆", "菱形", "星形"]
COLORS = ["红色", "绿色", "蓝色", "黄色", "紫色", "青色", "橙色", "粉色", "白色", "灰色"]
SPEEDS = [80, 120, 160, 200, 240, 300, 360]
GRAVITIES = [200, 300, 400, 500, 600, 800, 1000]
COUNTS = [3, 5, 8, 10, 12, 15, 20]
SIZES = [16, 24, 32, 48, 64, 80]
DURATIONS = [0.5, 1, 1.5, 2, 2.5, 3, 4]
DIRECTIONS = ["上", "下", "左", "右", "左上", "左下", "右上", "右下"]
KEYS = ["空格键", "方向键", "WASD键", "鼠标左键", "鼠标右键"]
EFFECTS = ["淡入淡出", "缩放", "旋转", "闪烁", "抖动", "弹跳"]
GAME_TYPES = ["收集", "躲避", "射击", "跳跃", "追逐", "拼图"]


# ============ Easy 模板 (40%) ============
EASY_TEMPLATES = [
    # 基础绘图
    {
        "modules": ["Scene", "GameObjects"],
        "task_tpl": "在画布中央绘制一个{color}{shape}，大小约为 {size} 像素。",
        "apis": ["Phaser.GameObjects.Graphics"],
        "hints": ["应使用 Graphics 绑定到场景", "应绘制指定形状", "位置应在画布中央"],
        "tags": ["graphics", "draw", "basic"],
        "params": ["color", "shape", "size"],
    },
    {
        "modules": ["Scene", "GameObjects"],
        "task_tpl": "绘制{count}个随机位置的{color}{shape}，每个大小为 {size} 像素。",
        "apis": ["Phaser.GameObjects.Graphics"],
        "hints": ["应绘制指定数量的形状", "位置应随机分布", "形状大小一致"],
        "tags": ["graphics", "random", "multiple"],
        "params": ["count", "color", "shape", "size"],
    },
    # 拖拽交互
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现一个可拖拽的{color}{shape}，拖拽时改变颜色，松手后回到初始位置。",
        "apis": ["Phaser.Input.Events.GAMEOBJECT_DRAG", "Phaser.GameObjects.Graphics"],
        "hints": ["应启用交互并监听拖拽事件", "拖拽过程中位置应跟随指针", "松手后回到初始坐标"],
        "tags": ["drag", "graphics", "input"],
        "params": ["color", "shape"],
    },
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现一个可拖拽的{shape}，拖拽时缩放到 1.2 倍，松手后恢复原大小。",
        "apis": ["Phaser.Input.Events.GAMEOBJECT_DRAG", "Phaser.GameObjects.Graphics"],
        "hints": ["应启用交互并监听拖拽事件", "拖拽时应用缩放", "松手后恢复原始缩放"],
        "tags": ["drag", "scale", "input"],
        "params": ["shape"],
    },
    # 点击生成
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现点击画面生成{shape}的功能：每次点击生成一个随机颜色的{shape}。",
        "apis": ["Phaser.Input.Events.POINTER_DOWN", "Phaser.GameObjects.Graphics"],
        "hints": ["应监听 pointerdown", "每次点击新增一个对象", "颜色应随机"],
        "tags": ["spawn", "pointer", "graphics"],
        "params": ["shape"],
    },
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "点击画布任意位置，在点击处生成一个{size}像素的{color}{shape}。",
        "apis": ["Phaser.Input.Events.POINTER_DOWN", "Phaser.GameObjects.Graphics"],
        "hints": ["应监听 pointerdown", "在点击坐标处生成形状", "形状颜色和大小正确"],
        "tags": ["spawn", "click", "position"],
        "params": ["size", "color", "shape"],
    },
    # 键盘移动
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现键盘方向键控制一个{color}{shape}移动，移动速度为 {speed}，限制在画布边界内。",
        "apis": ["Phaser.Input.Keyboard.KeyCodes", "Phaser.GameObjects.Graphics"],
        "hints": ["应创建键盘输入", "对象位置随按键变化", "对象不能移出边界"],
        "tags": ["keyboard", "movement", "bounds"],
        "params": ["color", "shape", "speed"],
    },
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "使用 WASD 键控制一个{shape}移动，速度为 {speed} 像素/秒。",
        "apis": ["Phaser.Input.Keyboard.KeyCodes", "Phaser.GameObjects.Graphics"],
        "hints": ["应监听 WASD 按键", "对象随按键移动", "速度符合设定"],
        "tags": ["wasd", "movement", "keyboard"],
        "params": ["shape", "speed"],
    },
    # 补间动画
    {
        "modules": ["Scene", "Animations"],
        "task_tpl": "实现一个补间动画：让一个{color}{shape}在 {duration} 秒内从左移动到右，然后往返循环。",
        "apis": ["Phaser.Tweens.Tween", "Phaser.GameObjects.Graphics"],
        "hints": ["应创建 tween", "对象应左右往返移动", "动画应循环"],
        "tags": ["tween", "loop", "motion"],
        "params": ["color", "shape", "duration"],
    },
    {
        "modules": ["Scene", "Animations"],
        "task_tpl": "让一个{shape}在 {duration} 秒内从透明渐变到完全不透明，循环播放。",
        "apis": ["Phaser.Tweens.Tween", "Phaser.GameObjects.Graphics"],
        "hints": ["应创建 alpha tween", "透明度从 0 到 1 变化", "动画应循环"],
        "tags": ["tween", "fade", "alpha"],
        "params": ["shape", "duration"],
    },
    {
        "modules": ["Scene", "Animations"],
        "task_tpl": "创建一个{effect}动画效果：让{color}{shape}在 {duration} 秒内完成一次{effect}，然后循环。",
        "apis": ["Phaser.Tweens.Tween", "Phaser.GameObjects.Graphics"],
        "hints": ["应创建 tween", "应实现指定效果", "动画应循环"],
        "tags": ["tween", "effect", "animation"],
        "params": ["effect", "color", "shape", "duration"],
    },
    # 相机基础
    {
        "modules": ["Scene", "Camera"],
        "task_tpl": "实现相机跟随：让一个自动向{direction}移动的{shape}在场景中移动，相机跟随该对象并保持居中。",
        "apis": ["Phaser.Cameras.Scene2D.Camera", "Phaser.GameObjects.Graphics"],
        "hints": ["应创建可移动目标", "相机应 startFollow 目标", "目标移动时相机保持跟随"],
        "tags": ["camera", "follow", "motion"],
        "params": ["direction", "shape"],
    },
    {
        "modules": ["Scene", "Camera"],
        "task_tpl": "设置相机边界：创建一个 1600x1200 的大场景，限制相机只能在场景范围内移动。",
        "apis": ["Phaser.Cameras.Scene2D.Camera"],
        "hints": ["应设置世界边界", "应设置相机边界", "相机不能移出边界"],
        "tags": ["camera", "bounds", "world"],
        "params": [],
    },
    # 文本显示
    {
        "modules": ["Scene", "GameObjects"],
        "task_tpl": "在屏幕{direction}显示一段文字 \"Hello Phaser\"，字体大小为 {size} 像素。",
        "apis": ["Phaser.GameObjects.Text"],
        "hints": ["应创建 Text 对象", "位置在指定方向", "字体大小正确"],
        "tags": ["text", "ui", "display"],
        "params": ["direction", "size"],
    },
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现一个计数器 UI：每次点击画面，计数 +1，并在屏幕左上角显示当前计数。",
        "apis": ["Phaser.Input.Events.POINTER_DOWN", "Phaser.GameObjects.Text"],
        "hints": ["应监听 pointerdown", "计数变量递增", "Text 内容实时更新"],
        "tags": ["ui", "text", "counter"],
        "params": [],
    },
    # 粒子基础
    {
        "modules": ["Scene", "Particles"],
        "task_tpl": "在画布中央创建一个持续发射粒子的发射器，粒子数量上限 {count} 个。",
        "apis": ["Phaser.GameObjects.Particles.ParticleEmitter"],
        "hints": ["应创建粒子发射器", "粒子持续发射", "数量有上限"],
        "tags": ["particles", "emitter", "basic"],
        "params": ["count"],
    },
    {
        "modules": ["Scene", "Particles", "Input"],
        "task_tpl": "实现一个粒子跟随效果：指针移动时在指针位置发射粒子拖尾。",
        "apis": ["Phaser.GameObjects.Particles.ParticleEmitter", "Phaser.Input.Events.POINTER_MOVE"],
        "hints": ["应监听 pointermove", "应创建粒子发射器", "粒子应随指针产生拖尾效果"],
        "tags": ["particles", "trail", "pointer"],
        "params": [],
    },
    # 定时器
    {
        "modules": ["Scene", "GameObjects"],
        "task_tpl": "每隔 {duration} 秒在随机位置生成一个{color}{shape}，最多生成 {count} 个。",
        "apis": ["Phaser.Time.TimerEvent", "Phaser.GameObjects.Graphics"],
        "hints": ["应使用定时器", "定时触发生成", "数量有上限"],
        "tags": ["timer", "spawn", "interval"],
        "params": ["duration", "color", "shape", "count"],
    },
    {
        "modules": ["Scene", "GameObjects"],
        "task_tpl": "创建一个倒计时 {count} 秒的计时器，在屏幕中央显示剩余时间，归零时显示 \"时间到\"。",
        "apis": ["Phaser.Time.TimerEvent", "Phaser.GameObjects.Text"],
        "hints": ["应使用定时器更新倒计时", "文本实时显示剩余时间", "归零时显示结束信息"],
        "tags": ["timer", "countdown", "text"],
        "params": ["count"],
    },
    # 鼠标跟随
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "让一个{color}{shape}平滑跟随鼠标指针移动，跟随速度为 {speed}。",
        "apis": ["Phaser.Input.Pointer", "Phaser.GameObjects.Graphics"],
        "hints": ["应获取指针位置", "对象向指针位置移动", "移动应平滑"],
        "tags": ["follow", "pointer", "smooth"],
        "params": ["color", "shape", "speed"],
    },
    # 旋转
    {
        "modules": ["Scene", "GameObjects"],
        "task_tpl": "让一个{shape}以每秒 {speed} 度的速度持续旋转。",
        "apis": ["Phaser.GameObjects.Graphics"],
        "hints": ["应在 update 中更新 rotation", "旋转速度符合设定", "旋转持续进行"],
        "tags": ["rotation", "update", "continuous"],
        "params": ["shape", "speed"],
    },
    # 边界反弹
    {
        "modules": ["Scene", "GameObjects"],
        "task_tpl": "让一个{color}{shape}以 {speed} 速度移动，碰到画布边界时反弹。",
        "apis": ["Phaser.GameObjects.Graphics"],
        "hints": ["应检测边界碰撞", "碰到边界时速度反向", "对象持续移动"],
        "tags": ["bounce", "boundary", "movement"],
        "params": ["color", "shape", "speed"],
    },
    # 缩放动画
    {
        "modules": ["Scene", "Animations"],
        "task_tpl": "让一个{shape}在 {duration} 秒内从原始大小缩放到 {size}%，然后恢复，循环播放。",
        "apis": ["Phaser.Tweens.Tween", "Phaser.GameObjects.Graphics"],
        "hints": ["应创建 scale tween", "缩放到指定比例后恢复", "动画循环"],
        "tags": ["tween", "scale", "loop"],
        "params": ["shape", "duration", "size"],
    },
]


# ============ Medium 模板 (40%) ============
MEDIUM_TEMPLATES = [
    # 平台跳跃
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "实现一个简易平台跳跃：角色可左右移动与跳跃，重力为 {gravity}，移动速度 {speed}，与地面碰撞不穿透。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.Input.Keyboard.KeyCodes"],
        "hints": ["应启用 Arcade Physics", "角色受重力影响并可跳跃", "角色与地面应发生碰撞并阻止穿透"],
        "tags": ["platformer", "arcade", "jump"],
        "params": ["gravity", "speed"],
    },
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "实现双跳功能：角色可跳跃两次后才需落地，跳跃力度为 {speed}，重力 {gravity}。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.Input.Keyboard.KeyCodes"],
        "hints": ["应追踪跳跃次数", "最多允许双跳", "落地后重置跳跃次数"],
        "tags": ["double-jump", "platformer", "input"],
        "params": ["speed", "gravity"],
    },
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "实现平台跳跃+收集：角色跳跃收集空中的 {count} 个金币，重力 {gravity}，显示 score。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.Physics.Arcade.Group"],
        "hints": ["角色可跳跃", "收集金币加分", "显示分数"],
        "tags": ["platformer", "collect", "score"],
        "params": ["count", "gravity"],
    },
    # 收集物品
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "实现收集物品玩法：场景中生成 {count} 个{color}可收集物体，玩家碰到后消失并加分，显示 score。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
        "hints": ["应生成多个可收集对象", "发生 overlap 后对象销毁/禁用", "score 变量与 Text 同步更新"],
        "tags": ["collect", "score", "overlap"],
        "params": ["count", "color"],
    },
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "收集游戏：{count} 个{shape}随机分布，收集完成后显示 \"恭喜通关\"。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
        "hints": ["应生成随机分布的物品", "收集后物品消失", "全部收集后显示通关"],
        "tags": ["collect", "complete", "game"],
        "params": ["count", "shape"],
    },
    {
        "modules": ["Scene", "Physics", "GameObjects", "Input"],
        "task_tpl": "限时收集：在 {count} 秒内收集所有物品，玩家速度 {speed}，超时显示失败。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.Time.TimerEvent"],
        "hints": ["显示倒计时", "收集完成显示胜利", "超时显示失败"],
        "tags": ["collect", "timer", "challenge"],
        "params": ["count", "speed"],
    },
    # 射击
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "实现按{key}发射{color}子弹的例子，子弹速度 {speed}，离开边界回收（使用对象池）。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.Input.Keyboard.KeyCodes"],
        "hints": ["应使用 group 作为对象池", "按键触发生成/复用子弹", "子弹离开边界应回收"],
        "tags": ["shoot", "pool", "keyboard"],
        "params": ["key", "color", "speed"],
    },
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "实现射击敌人：按{key}发射子弹，速度 {speed}，命中敌人时敌人消失，显示击杀数。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
        "hints": ["应检测子弹与敌人碰撞", "碰撞后双方销毁/回收", "击杀数更新"],
        "tags": ["shoot", "enemy", "collision"],
        "params": ["key", "speed"],
    },
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "实现多方向射击：按{key}向当前朝向发射子弹，子弹速度 {speed}，玩家可旋转改变朝向。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.Math.Angle"],
        "hints": ["玩家可旋转", "子弹朝玩家朝向发射", "速度正确"],
        "tags": ["shoot", "rotate", "direction"],
        "params": ["key", "speed"],
    },
    # 状态切换
    {
        "modules": ["Scene", "Animations", "Input"],
        "task_tpl": "实现{color}角色状态切换：按下不同按键切换 idle/run 状态，通过 tween 或帧动画体现差异。",
        "apis": ["Phaser.Tweens.Tween", "Phaser.Input.Keyboard.KeyCodes"],
        "hints": ["应维护 state 变量", "不同状态触发不同动画/运动", "状态切换应可重复触发且稳定"],
        "tags": ["state", "animation", "input"],
        "params": ["color"],
    },
    {
        "modules": ["Scene", "Animations", "Input"],
        "task_tpl": "角色有 3 种状态：静止、行走、跑步，速度分别为 0/{speed}/{speed}*2，按键切换并显示当前状态。",
        "apis": ["Phaser.Tweens.Tween", "Phaser.GameObjects.Text"],
        "hints": ["应维护状态变量", "不同状态速度不同", "UI 显示当前状态"],
        "tags": ["state", "speed", "display"],
        "params": ["speed"],
    },
    {
        "modules": ["Scene", "Animations", "GameObjects"],
        "task_tpl": "实现{count}个物体的同步{effect}动画，持续 {duration} 秒后停止。",
        "apis": ["Phaser.Tweens.Tween", "Phaser.GameObjects.Graphics"],
        "hints": ["多个物体同步动画", "动画效果一致", "按时停止"],
        "tags": ["animation", "sync", "multiple"],
        "params": ["count", "effect", "duration"],
    },
    # 相机
    {
        "modules": ["Scene", "Camera", "Physics"],
        "task_tpl": "实现追踪镜头与震屏：玩家与敌人碰撞时触发 camera shake {duration} 秒，并扣减生命值显示。",
        "apis": ["Phaser.Cameras.Scene2D.Camera", "Phaser.Physics.Arcade.Sprite"],
        "hints": ["应维护 health 变量", "碰撞事件触发 health 变化", "碰撞时应触发相机 shake"],
        "tags": ["camera", "shake", "health"],
        "params": ["duration"],
    },
    {
        "modules": ["Scene", "Camera", "Input"],
        "task_tpl": "按{key}触发相机{effect}效果，持续 {duration} 秒。",
        "apis": ["Phaser.Cameras.Scene2D.Camera", "Phaser.Input.Keyboard.KeyCodes"],
        "hints": ["应监听按键", "触发相机效果", "参数正确"],
        "tags": ["camera", "effect", "input"],
        "params": ["key", "effect", "duration"],
    },
    {
        "modules": ["Scene", "Camera", "GameObjects"],
        "task_tpl": "实现相机缩放：按{key}放大/缩小相机视野，缩放范围 0.5-2 倍。",
        "apis": ["Phaser.Cameras.Scene2D.Camera", "Phaser.Input.Keyboard.KeyCodes"],
        "hints": ["按键控制缩放", "缩放有范围限制", "过渡平滑"],
        "tags": ["camera", "zoom", "input"],
        "params": ["key"],
    },
    # Tilemap
    {
        "modules": ["Scene", "Tilemap", "Input", "Physics"],
        "task_tpl": "实现一个基于 {count}x{count} 数组的简单 Tilemap：0 为空，1 为墙可碰撞，玩家用方向键移动且不能穿墙。",
        "apis": ["Phaser.Tilemaps.Tilemap", "Phaser.Physics.Arcade.Sprite"],
        "hints": ["应从数组数据生成 tilemap/layer", "墙体应具有碰撞", "玩家移动时不能穿墙"],
        "tags": ["tilemap", "collision", "grid"],
        "params": ["count"],
    },
    {
        "modules": ["Scene", "Tilemap", "GameObjects"],
        "task_tpl": "用 {count}x{count} 的二维数组生成{color}棋盘格地图，交替显示两种颜色。",
        "apis": ["Phaser.Tilemaps.Tilemap", "Phaser.GameObjects.Graphics"],
        "hints": ["应根据数组生成地图", "颜色交替显示", "尺寸正确"],
        "tags": ["tilemap", "grid", "pattern"],
        "params": ["count", "color"],
    },
    {
        "modules": ["Scene", "Tilemap", "Physics"],
        "task_tpl": "生成一个带有随机障碍的 {count}x{count} 地图，障碍密度约 30%，玩家可寻路移动。",
        "apis": ["Phaser.Tilemaps.Tilemap", "Phaser.Physics.Arcade.Sprite"],
        "hints": ["随机生成障碍", "障碍有碰撞", "玩家可移动"],
        "tags": ["tilemap", "random", "obstacle"],
        "params": ["count"],
    },
    # 躲避游戏
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "实现躲避游戏：{color}敌人从上方以 {speed} 速度落下，玩家左右移动躲避，碰到游戏结束。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.Input.Keyboard.KeyCodes"],
        "hints": ["敌人持续生成并下落", "检测玩家与敌人碰撞", "碰撞后游戏结束"],
        "tags": ["dodge", "enemy", "gameover"],
        "params": ["color", "speed"],
    },
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "每 {duration} 秒从顶部随机位置生成一个{color}下落障碍物，速度为 {speed}。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.Time.TimerEvent"],
        "hints": ["使用定时器生成障碍", "障碍物下落", "位置随机"],
        "tags": ["spawn", "timer", "falling"],
        "params": ["duration", "color", "speed"],
    },
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "躲避游戏升级版：敌人速度随时间从 {speed} 逐渐加快，显示生存时间。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
        "hints": ["敌人速度递增", "显示生存时间", "碰撞结束游戏"],
        "tags": ["dodge", "difficulty", "survival"],
        "params": ["speed"],
    },
    # 血条系统
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现{color}血条 UI：显示 {count} 格生命值，按{key}扣血，血量为 0 时显示 Game Over。",
        "apis": ["Phaser.GameObjects.Graphics", "Phaser.GameObjects.Text"],
        "hints": ["应绘制血条", "按键扣血并更新显示", "血量归零显示结束"],
        "tags": ["health", "ui", "bar"],
        "params": ["color", "count", "key"],
    },
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现血条+回血：显示 {count} 格生命值，按{key}扣血，每 {duration} 秒自动回复 1 点。",
        "apis": ["Phaser.GameObjects.Graphics", "Phaser.Time.TimerEvent"],
        "hints": ["血条显示正确", "扣血和回血逻辑正确", "有上限限制"],
        "tags": ["health", "regen", "timer"],
        "params": ["count", "key", "duration"],
    },
    # 对象池
    {
        "modules": ["Scene", "Physics"],
        "task_tpl": "使用对象池管理 {count} 个{color}可复用对象，对象离开屏幕后自动回收并重新使用。",
        "apis": ["Phaser.Physics.Arcade.Group"],
        "hints": ["应配置 Group 为对象池", "对象离开屏幕回收", "回收后可重新激活"],
        "tags": ["pool", "recycle", "performance"],
        "params": ["count", "color"],
    },
    # 碰撞检测
    {
        "modules": ["Scene", "Physics"],
        "task_tpl": "{count} 个{color}物体以 {speed} 速度随机移动，碰撞时反弹。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Graphics"],
        "hints": ["应设置碰撞检测", "碰撞时速度反向", "持续移动"],
        "tags": ["collision", "bounce", "physics"],
        "params": ["count", "color", "speed"],
    },
    # 追踪移动
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "实现{color}敌人追踪：敌人以 {speed} 速度追踪玩家位置，玩家速度 {speed}*1.2 可躲避。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.Math.Angle"],
        "hints": ["敌人朝玩家方向移动", "玩家可控制移动", "持续追踪"],
        "tags": ["chase", "ai", "movement"],
        "params": ["color", "speed"],
    },
    {
        "modules": ["Scene", "Physics"],
        "task_tpl": "{count} 个敌人同时追踪玩家，敌人速度 {speed}，玩家需躲避。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.Math.Angle"],
        "hints": ["多个敌人追踪", "敌人速度一致", "碰撞检测"],
        "tags": ["chase", "multi", "ai"],
        "params": ["count", "speed"],
    },
    # 得分系统
    {
        "modules": ["Scene", "GameObjects"],
        "task_tpl": "实现自动加分系统：每 {duration} 秒 score +{count}，字体大小 {size}，在屏幕右上角显示分数。",
        "apis": ["Phaser.Time.TimerEvent", "Phaser.GameObjects.Text"],
        "hints": ["使用定时器加分", "分数持续增加", "UI 实时更新"],
        "tags": ["score", "timer", "auto"],
        "params": ["duration", "count", "size"],
    },
    # 边界传送
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "{color}玩家移出边界时从对侧出现（循环地图效果），移动速度 {speed}。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.Input.Keyboard.KeyCodes"],
        "hints": ["检测边界穿越", "传送到对侧", "四个方向都可循环"],
        "tags": ["wrap", "boundary", "teleport"],
        "params": ["color", "speed"],
    },
    # 多物体控制
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "同时控制 {count} 个{color}对象：按方向键时所有对象同步移动，速度 {speed}。",
        "apis": ["Phaser.GameObjects.Group", "Phaser.Input.Keyboard.KeyCodes"],
        "hints": ["创建多个对象", "按键时全部移动", "保持同步"],
        "tags": ["group", "sync", "control"],
        "params": ["count", "color", "speed"],
    },
    # 渐变效果
    {
        "modules": ["Scene", "Animations", "Camera"],
        "task_tpl": "实现场景{effect}效果：场景开始时{effect}，持续 {duration} 秒。",
        "apis": ["Phaser.Cameras.Scene2D.Camera"],
        "hints": ["使用相机效果", "持续时间正确", "效果平滑"],
        "tags": ["fade", "camera", "transition"],
        "params": ["effect", "duration"],
    },
    # 弹性物理
    {
        "modules": ["Scene", "Physics"],
        "task_tpl": "实现弹性碰撞：{count} 个{color}小球以 {speed} 速度在封闭空间内移动，碰到边界和彼此时弹开。",
        "apis": ["Phaser.Physics.Arcade.Group"],
        "hints": ["设置边界碰撞", "设置对象间碰撞", "弹性效果"],
        "tags": ["elastic", "bounce", "multi"],
        "params": ["count", "color", "speed"],
    },
    # 额外新增模板
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "实现{color}角色冲刺：按{key}进行短距离冲刺，冲刺速度为 {speed}*3，冷却 {duration} 秒。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.Time.TimerEvent"],
        "hints": ["冲刺速度加快", "冷却期间不能再次冲刺", "显示冷却状态"],
        "tags": ["dash", "cooldown", "movement"],
        "params": ["color", "key", "speed", "duration"],
    },
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "{count} 个{color}敌人巡逻移动，在 {speed} 速度下左右往返，玩家接近时追踪。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.Math.Distance"],
        "hints": ["敌人默认巡逻", "检测玩家距离", "接近时追踪"],
        "tags": ["patrol", "ai", "detection"],
        "params": ["count", "color", "speed"],
    },
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现{color}物体拖拽排序：{count} 个物体可拖拽，松手后按 Y 坐标自动排列。",
        "apis": ["Phaser.Input.Events.GAMEOBJECT_DRAG", "Phaser.GameObjects.Graphics"],
        "hints": ["物体可拖拽", "松手后排序", "位置平滑过渡"],
        "tags": ["drag", "sort", "arrangement"],
        "params": ["color", "count"],
    },
    {
        "modules": ["Scene", "Physics"],
        "task_tpl": "实现重力场效果：{count} 个小球受中心点吸引，吸引力与距离成反比，吸引速度基准 {speed}。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.Math.Distance"],
        "hints": ["小球被吸引", "距离越近吸引力越大", "可绕中心旋转"],
        "tags": ["gravity", "attraction", "physics"],
        "params": ["count", "speed"],
    },
    {
        "modules": ["Scene", "GameObjects"],
        "task_tpl": "实现进度条 UI：从 0 到 {count} 的{color}进度条，每秒增加 1，满后显示完成。",
        "apis": ["Phaser.GameObjects.Graphics", "Phaser.Time.TimerEvent"],
        "hints": ["进度条显示正确", "每秒更新", "满后显示完成"],
        "tags": ["progress", "ui", "timer"],
        "params": ["count", "color"],
    },
]


# ============ Hard 模板 (20%) ============
HARD_TEMPLATES = [
    # 多场景
    {
        "modules": ["Scene", "GameObjects"],
        "task_tpl": "实现双场景流程：LoadingScene 预加载资源（显示{color}进度条），完成后切换到 MainScene。",
        "apis": ["Phaser.Scene", "Phaser.GameObjects.Text"],
        "hints": ["应包含至少两个 Scene", "应从 LoadingScene 切换到 MainScene", "MainScene 应显示文本或可见 UI 信号"],
        "tags": ["scene", "loading", "flow"],
        "params": ["color"],
    },
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现菜单和游戏双场景：MenuScene 显示{color}\"开始游戏\" 按钮，点击后切换到 GameScene。",
        "apis": ["Phaser.Scene", "Phaser.GameObjects.Text"],
        "hints": ["MenuScene 显示按钮", "点击触发场景切换", "GameScene 正常运行"],
        "tags": ["scene", "menu", "button"],
        "params": ["color"],
    },
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现三场景流程：MenuScene -> GameScene -> GameOverScene，GameOver 显示分数并可重新开始。",
        "apis": ["Phaser.Scene", "Phaser.GameObjects.Text"],
        "hints": ["三个场景正确切换", "GameOver 显示分数", "可重新开始游戏"],
        "tags": ["scene", "flow", "restart"],
        "params": [],
    },
    # 关卡系统
    {
        "modules": ["Scene", "Physics", "Input", "GameObjects"],
        "task_tpl": "实现一个带关卡的{color}收集玩法：共 {count} 关，每关收集完物品后进入下一关，显示 level 与 score。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
        "hints": ["应维护 level/score 状态", "收集完触发下一关重置布局", "UI 应正确显示当前 level 与 score"],
        "tags": ["level", "progress", "score"],
        "params": ["color", "count"],
    },
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "每关难度递增：第 1 关 {count} 个{color}敌人，每关增加 2 个，共 5 关，显示当前关卡和敌人数。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
        "hints": ["敌人数量递增", "关卡切换正确", "UI 显示关卡"],
        "tags": ["difficulty", "progression", "level"],
        "params": ["count", "color"],
    },
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "实现关卡+限时：{count} 关，每关限时 {duration} 秒，超时失败，通关显示总用时。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.Time.TimerEvent"],
        "hints": ["每关有时间限制", "超时显示失败", "通关显示总用时"],
        "tags": ["level", "timer", "challenge"],
        "params": ["count", "duration"],
    },
    # 确定性生成
    {
        "modules": ["Scene", "Physics"],
        "task_tpl": "实现确定性生成：基于固定 seed 生成 {count} 个{color}障碍物布局，相同 seed 下布局一致，显示当前 seed。",
        "apis": ["Phaser.Math.RND", "Phaser.GameObjects.Text"],
        "hints": ["应提供可配置 seed", "相同 seed 下生成布局一致", "应显示 seed 值用于验证"],
        "tags": ["seed", "deterministic", "layout"],
        "params": ["count", "color"],
    },
    {
        "modules": ["Scene", "Physics"],
        "task_tpl": "程序化关卡生成：用 seed 生成 {count}x{count} 的迷宫，显示 seed 以便复现。",
        "apis": ["Phaser.Math.RND", "Phaser.GameObjects.Graphics"],
        "hints": ["用 seed 控制随机", "生成可通行迷宫", "显示 seed"],
        "tags": ["seed", "maze", "procedural"],
        "params": ["count"],
    },
    # 对象池压力测试
    {
        "modules": ["Scene", "Physics"],
        "task_tpl": "实现对象池压力测试：持续生成/回收 {count} 个{color}子弹对象，使用对象池避免无限增长，输出当前活动对象数量。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
        "hints": ["应使用对象池复用实例", "活动对象数量应有上限", "UI 输出当前活动数量用于验证"],
        "tags": ["pool", "stress", "metrics"],
        "params": ["count", "color"],
    },
    # 暂停/继续
    {
        "modules": ["Scene", "Input"],
        "task_tpl": "实现游戏暂停：按{key}暂停/继续游戏，暂停时显示{color} \"PAUSED\" 覆盖层。",
        "apis": ["Phaser.Scene", "Phaser.GameObjects.Text"],
        "hints": ["按键切换暂停状态", "暂停时物理/动画停止", "显示暂停提示"],
        "tags": ["pause", "resume", "overlay"],
        "params": ["key", "color"],
    },
    {
        "modules": ["Scene", "Input", "GameObjects"],
        "task_tpl": "暂停菜单：按{key}暂停并显示菜单（继续/重新开始/返回主菜单三个选项）。",
        "apis": ["Phaser.Scene", "Phaser.GameObjects.Text"],
        "hints": ["暂停显示菜单", "菜单选项可点击", "各选项功能正确"],
        "tags": ["pause", "menu", "options"],
        "params": ["key"],
    },
    # 存档系统
    {
        "modules": ["Scene", "GameObjects"],
        "task_tpl": "实现简单存档：将 score({count} 分起始) 和 level 保存到 localStorage，下次启动时读取并恢复。",
        "apis": ["Phaser.GameObjects.Text"],
        "hints": ["使用 localStorage 存储", "启动时读取", "数据正确恢复"],
        "tags": ["save", "load", "storage"],
        "params": ["count"],
    },
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "存档系统：按{key}保存当前玩家位置和分数，按另一键读取存档恢复状态。",
        "apis": ["Phaser.GameObjects.Text"],
        "hints": ["保存位置和分数", "读取时恢复", "显示存档状态"],
        "tags": ["save", "load", "position"],
        "params": ["key"],
    },
    # 波次生成
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "实现波次敌人生成：每波 {count} 个{color}敌人，敌人速度 {speed}，消灭完后等 2 秒进入下一波，显示当前波次。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.Time.TimerEvent"],
        "hints": ["按波次生成敌人", "消灭完触发下一波", "UI 显示波次"],
        "tags": ["wave", "spawn", "timer"],
        "params": ["count", "color", "speed"],
    },
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "无尽模式波次：每波敌人数从 {count} 开始，每波增加 1 个，速度从 {speed} 逐渐提升，显示波次和击杀数。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
        "hints": ["敌人数和速度递增", "无尽模式", "显示统计"],
        "tags": ["wave", "endless", "progression"],
        "params": ["count", "speed"],
    },
    # 技能冷却
    {
        "modules": ["Scene", "Input", "GameObjects"],
        "task_tpl": "实现{color}技能冷却：按{key}释放技能，冷却 {duration} 秒内不可再次使用，显示冷却进度。",
        "apis": ["Phaser.Time.TimerEvent", "Phaser.GameObjects.Graphics"],
        "hints": ["技能有冷却时间", "冷却中禁止触发", "显示冷却进度条"],
        "tags": ["cooldown", "skill", "ui"],
        "params": ["color", "key", "duration"],
    },
    {
        "modules": ["Scene", "Input", "GameObjects"],
        "task_tpl": "多技能系统：{count} 个技能各有不同冷却时间（{duration} 秒基准递增），显示所有技能冷却状态。",
        "apis": ["Phaser.Time.TimerEvent", "Phaser.GameObjects.Graphics"],
        "hints": ["多个技能独立冷却", "显示所有冷却状态", "按键对应不同技能"],
        "tags": ["cooldown", "multi-skill", "ui"],
        "params": ["count", "duration"],
    },
    # 碰撞伤害
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "实现碰撞伤害与{color}无敌帧：碰撞扣 1 血，之后 {duration} 秒内无敌（闪烁提示），共 {count} 血，显示血量。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.Tweens.Tween"],
        "hints": ["碰撞扣血", "无敌期间闪烁", "无敌期间不扣血"],
        "tags": ["damage", "invincible", "flash"],
        "params": ["color", "duration", "count"],
    },
    # 移动平台
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "实现{color}移动平台：平台以 {speed} 速度水平往返移动，玩家可站在上面并跟随移动，重力 {gravity}。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.Tweens.Tween"],
        "hints": ["平台往返移动", "玩家可站立", "玩家跟随平台移动"],
        "tags": ["platform", "moving", "follow"],
        "params": ["color", "speed", "gravity"],
    },
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "{count} 个移动平台组成路径，玩家需要跳跃通过，平台速度 {speed}。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.Tweens.Tween"],
        "hints": ["多个平台移动", "玩家可跳跃通过", "形成可通行路径"],
        "tags": ["platform", "multi", "path"],
        "params": ["count", "speed"],
    },
    # 连击系统
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现{color}连击计数：{duration} 秒内连续点击增加 combo，超时 combo 重置为 0，显示当前 combo，连击 {count} 次触发特效。",
        "apis": ["Phaser.Time.TimerEvent", "Phaser.GameObjects.Text"],
        "hints": ["追踪连击次数", "超时重置", "达到目标触发特效"],
        "tags": ["combo", "timer", "effect"],
        "params": ["color", "duration", "count"],
    },
    # 粒子爆炸
    {
        "modules": ["Scene", "Particles", "Physics"],
        "task_tpl": "{color}敌人死亡时触发粒子爆炸效果：发射 {count} 个粒子向四周扩散后消失，持续 {duration} 秒。",
        "apis": ["Phaser.GameObjects.Particles.ParticleEmitter", "Phaser.Physics.Arcade.Sprite"],
        "hints": ["死亡触发粒子", "粒子向四周扩散", "粒子自动消失"],
        "tags": ["particles", "explosion", "death"],
        "params": ["color", "count", "duration"],
    },
    {
        "modules": ["Scene", "Particles"],
        "task_tpl": "实现 {count} 种不同颜色的粒子效果，可按{key}切换当前粒子类型。",
        "apis": ["Phaser.GameObjects.Particles.ParticleEmitter"],
        "hints": ["多种粒子效果", "按键切换", "效果明显不同"],
        "tags": ["particles", "switch", "multi"],
        "params": ["count", "key"],
    },
    # 小地图
    {
        "modules": ["Scene", "Camera", "GameObjects"],
        "task_tpl": "实现小地图：主相机跟随玩家（速度 {speed}），右上角显示一个缩小的全局视角小地图。",
        "apis": ["Phaser.Cameras.Scene2D.Camera", "Phaser.GameObjects.Graphics"],
        "hints": ["主相机跟随玩家", "第二相机显示全局", "小地图在右上角"],
        "tags": ["minimap", "camera", "dual"],
        "params": ["speed"],
    },
    # 重力切换
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "按{key}切换重力方向（向上/向下），重力大小 {gravity}，玩家根据重力方向移动，显示当前重力方向。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.GameObjects.Text"],
        "hints": ["按键切换重力", "物理引擎响应", "UI 显示状态"],
        "tags": ["gravity", "flip", "physics"],
        "params": ["key", "gravity"],
    },
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "四向重力切换：按不同方向键切换重力方向，重力大小 {gravity}，玩家和 {count} 个物体都受影响。",
        "apis": ["Phaser.Physics.Arcade.Group", "Phaser.GameObjects.Text"],
        "hints": ["四个方向重力", "所有物体受影响", "重力切换平滑"],
        "tags": ["gravity", "multi-direction", "physics"],
        "params": ["gravity", "count"],
    },
    # 回放系统
    {
        "modules": ["Scene", "Input", "GameObjects"],
        "task_tpl": "记录玩家 {duration} 秒内的操作序列，按{key}开始回放，回放速度可调。",
        "apis": ["Phaser.Input.Keyboard.KeyCodes", "Phaser.GameObjects.Text"],
        "hints": ["记录输入序列", "按键触发回放", "回放准确还原"],
        "tags": ["replay", "record", "playback"],
        "params": ["duration", "key"],
    },
    # Boss战
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "实现简单 Boss 战：{color}Boss 有 {count} 点血量，被子弹（速度 {speed}）命中扣血，血量归零时显示胜利。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.GameObjects.Text"],
        "hints": ["Boss 有血量", "子弹命中扣血", "血量归零胜利"],
        "tags": ["boss", "health", "victory"],
        "params": ["color", "count", "speed"],
    },
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "Boss 战+攻击模式：Boss 有 {count} 血，每 {duration} 秒发射攻击，玩家需躲避并反击。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.Time.TimerEvent"],
        "hints": ["Boss 定时攻击", "玩家需躲避", "玩家可反击"],
        "tags": ["boss", "attack", "pattern"],
        "params": ["count", "duration"],
    },
    # 额外模板
    {
        "modules": ["Scene", "Physics", "Input"],
        "task_tpl": "实现分屏多人：两个玩家各占半屏，各自控制角色，速度 {speed}，碰撞时双方弹开。",
        "apis": ["Phaser.Cameras.Scene2D.Camera", "Phaser.Physics.Arcade.Sprite"],
        "hints": ["分屏显示", "各自控制", "碰撞弹开"],
        "tags": ["split-screen", "multiplayer", "camera"],
        "params": ["speed"],
    },
    {
        "modules": ["Scene", "Physics", "GameObjects"],
        "task_tpl": "实现 AI 对战：{color}AI 角色以 {speed} 速度追踪玩家，玩家收集 {count} 个物品获胜，被 AI 碰到失败。",
        "apis": ["Phaser.Physics.Arcade.Sprite", "Phaser.Math.Angle"],
        "hints": ["AI 追踪玩家", "玩家收集物品", "碰撞判定胜负"],
        "tags": ["ai", "chase", "objective"],
        "params": ["color", "speed", "count"],
    },
    {
        "modules": ["Scene", "GameObjects", "Input"],
        "task_tpl": "实现成就系统：完成 {count} 个不同目标触发成就弹窗，成就保存到 localStorage。",
        "apis": ["Phaser.GameObjects.Text"],
        "hints": ["追踪多个目标", "完成触发弹窗", "成就持久化"],
        "tags": ["achievement", "popup", "storage"],
        "params": ["count"],
    },
    {
        "modules": ["Scene", "Physics", "Animations"],
        "task_tpl": "实现角色受伤效果：碰撞时{color}角色闪烁 {duration} 秒，同时播放击退效果（击退距离与速度 {speed} 相关）。",
        "apis": ["Phaser.Tweens.Tween", "Phaser.Physics.Arcade.Sprite"],
        "hints": ["碰撞触发闪烁", "击退效果", "无敌期间"],
        "tags": ["damage", "knockback", "effect"],
        "params": ["color", "duration", "speed"],
    },
]


def fill_template(tpl: dict, params: dict) -> Tuple[List[str], str, List[str], List[str], List[str]]:
    """填充模板参数"""
    task = tpl["task_tpl"].format(**params)
    return tpl["modules"], task, tpl["apis"], tpl["hints"], tpl["tags"]


def generate_prompts(rng: random.Random, templates: List[dict], count: int, difficulty: str) -> List[dict]:
    """从模板生成指定数量的 prompt"""
    results = []
    seen_tasks = set()

    # 预计算参数组合
    param_pool = {
        "color": COLORS,
        "shape": SHAPES,
        "size": SIZES,
        "speed": SPEEDS,
        "gravity": GRAVITIES,
        "count": COUNTS,
        "duration": DURATIONS,
        "direction": DIRECTIONS,
        "key": KEYS,
        "effect": EFFECTS,
    }

    attempts = 0
    max_attempts = count * 100

    while len(results) < count and attempts < max_attempts:
        attempts += 1
        tpl = rng.choice(templates)

        # 生成参数
        params = {}
        for p in tpl.get("params", []):
            if p in param_pool:
                params[p] = rng.choice(param_pool[p])

        # 填充模板
        modules, task, apis, hints, tags = fill_template(tpl, params)

        # 去重
        task_key = f"{difficulty}|{task}"
        if task_key in seen_tasks:
            continue
        seen_tasks.add(task_key)

        # 生成约束
        constraints = default_constraints(difficulty)

        # 随机添加额外约束变体
        if rng.random() < 0.3:
            constraints.append("不得使用外部图片资源，需程序化生成纹理")
        if rng.random() < 0.2 and difficulty != "easy":
            constraints.append("输出可验证的 signals，例如 window.__signals__ 或日志 JSON")

        seed_id = f"seed_{len(results)+1:06d}"
        results.append(make_seed(
            seed_id=seed_id,
            difficulty=difficulty,
            modules=modules,
            task=task,
            constraints=constraints,
            must_use_apis=apis,
            eval_hints=hints,
            tags=tags,
        ))

    return results


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

    # 生成各难度的 prompt
    easy_prompts = generate_prompts(rng, EASY_TEMPLATES, n_easy, "easy")
    medium_prompts = generate_prompts(rng, MEDIUM_TEMPLATES, n_medium, "medium")
    hard_prompts = generate_prompts(rng, HARD_TEMPLATES, n_hard, "hard")

    # 合并并重新编号
    all_prompts = []
    for i, p in enumerate(easy_prompts + medium_prompts + hard_prompts, 1):
        p["id"] = f"seed_{i:06d}"
        all_prompts.append(p)

    # 写入文件
    out_path = Path(args.out)
    write_jsonl(out_path, all_prompts)
    write_report_json(Path(args.report_json), all_prompts)
    write_coverage_csv(Path(args.coverage_csv), all_prompts)

    print(f"Generated {len(all_prompts)} prompts -> {out_path}")
    print(f"  Easy: {len(easy_prompts)}, Medium: {len(medium_prompts)}, Hard: {len(hard_prompts)}")


if __name__ == "__main__":
    main()
