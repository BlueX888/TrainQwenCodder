"""
教师模型 Mock 脚本

用于测试蒸馏管线，生成模拟的教师模型输出。
实际蒸馏时应替换为真实的 API 调用。
"""

import random
import argparse
from datetime import datetime

from common import (
    read_jsonl, write_jsonl, append_jsonl,
    get_data_path, ensure_dir,
    get_logger, print_progress, Checkpoint
)

logger = get_logger(__name__)

# Mock 代码模板
MOCK_CODE_TEMPLATES = [
    # 基础旋转
    '''const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { create, update }
};

let graphics;
const ROTATION_SPEED = {rotation_speed} * Math.PI / 180;

function create() {
  graphics = this.add.graphics();
  graphics.fillStyle(0x{color}, 1);
  graphics.fillCircle(0, 0, {radius});
  graphics.x = 400;
  graphics.y = 300;
}

function update(time, delta) {
  graphics.rotation += ROTATION_SPEED * delta / 1000;
}

new Phaser.Game(config);''',

    # 输入处理
    '''const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

let player;
let cursors;

function preload() {
  // 使用 graphics 替代图片
}

function create() {
  const graphics = this.add.graphics();
  graphics.fillStyle(0x{color}, 1);
  graphics.fillRect(-{size}/2, -{size}/2, {size}, {size});
  graphics.generateTexture('player', {size}, {size});
  graphics.destroy();

  player = this.add.sprite(400, 300, 'player');
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  const speed = {speed};
  if (cursors.left.isDown) player.x -= speed;
  if (cursors.right.isDown) player.x += speed;
  if (cursors.up.isDown) player.y -= speed;
  if (cursors.down.isDown) player.y += speed;
}

new Phaser.Game(config);''',

    # 点击交互
    '''const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载
}

function create() {
  const graphics = this.add.graphics();
  graphics.fillStyle(0x{color}, 1);
  graphics.fillRect(300, 200, {width}, {height});
  graphics.setInteractive(new Phaser.Geom.Rectangle(300, 200, {width}, {height}), Phaser.Geom.Rectangle.Contains);

  graphics.on('pointerdown', () => {
    graphics.fillStyle(0x{alt_color}, 1);
    graphics.clear();
    graphics.fillRect(300, 200, {width}, {height});
  });

  this.input.on('pointerdown', (pointer) => {
    console.log('Click at', pointer.x, pointer.y);
  });
}

new Phaser.Game(config);''',

    # 物理系统
    '''const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: {gravity} }, debug: false }
  },
  scene: { preload, create, update }
};

let player;
let cursors;

function preload() {
  // 创建纹理
}

function create() {
  const graphics = this.add.graphics();
  graphics.fillStyle(0x{color}, 1);
  graphics.fillRect(0, 0, {size}, {size});
  graphics.generateTexture('box', {size}, {size});
  graphics.destroy();

  player = this.physics.add.sprite(400, 100, 'box');
  player.setBounce({bounce});
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-{speed});
  } else if (cursors.right.isDown) {
    player.setVelocityX({speed});
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-{jump});
  }
}

new Phaser.Game(config);'''
]


def generate_mock_output(request: dict) -> dict:
    """
    生成模拟的教师模型输出

    Args:
        request: 蒸馏请求

    Returns:
        模拟的输出数据
    """
    prompt = request.get('prompt_meta', {})
    difficulty = prompt.get('difficulty', 'easy')
    modules = prompt.get('modules', [])
    task = prompt.get('task', '')

    # 选择模板
    template_idx = random.randint(0, len(MOCK_CODE_TEMPLATES) - 1)

    # 根据难度调整参数
    if difficulty == 'easy':
        params = {
            'rotation_speed': random.randint(30, 90),
            'color': format(random.randint(0, 0xFFFFFF), '06x'),
            'alt_color': format(random.randint(0, 0xFFFFFF), '06x'),
            'radius': random.randint(30, 60),
            'size': random.randint(32, 64),
            'width': random.randint(100, 200),
            'height': random.randint(80, 150),
            'speed': random.randint(3, 6),
            'gravity': random.randint(200, 400),
            'bounce': round(random.uniform(0.3, 0.6), 1),
            'jump': random.randint(300, 400)
        }
    elif difficulty == 'medium':
        params = {
            'rotation_speed': random.randint(60, 120),
            'color': format(random.randint(0, 0xFFFFFF), '06x'),
            'alt_color': format(random.randint(0, 0xFFFFFF), '06x'),
            'radius': random.randint(40, 80),
            'size': random.randint(32, 48),
            'width': random.randint(150, 250),
            'height': random.randint(100, 180),
            'speed': random.randint(4, 8),
            'gravity': random.randint(300, 500),
            'bounce': round(random.uniform(0.4, 0.8), 1),
            'jump': random.randint(350, 500)
        }
    else:  # hard
        params = {
            'rotation_speed': random.randint(90, 180),
            'color': format(random.randint(0, 0xFFFFFF), '06x'),
            'alt_color': format(random.randint(0, 0xFFFFFF), '06x'),
            'radius': random.randint(50, 100),
            'size': random.randint(24, 40),
            'width': random.randint(200, 300),
            'height': random.randint(150, 220),
            'speed': random.randint(5, 10),
            'gravity': random.randint(400, 600),
            'bounce': round(random.uniform(0.5, 0.9), 1),
            'jump': random.randint(400, 600)
        }

    # 生成代码
    template = MOCK_CODE_TEMPLATES[template_idx]
    code = template.format(**params)

    # 生成 Plan
    api_list = ['Phaser.Game', 'Phaser.Scene']
    if 'physics' in template.lower():
        api_list.extend(['Phaser.Physics.Arcade.Sprite', 'Phaser.Input.Keyboard.CursorKeys'])
    if 'graphics' in template.lower():
        api_list.append('Phaser.GameObjects.Graphics')
    if 'input' in template.lower():
        api_list.append('Phaser.Input.Pointer')

    plan_text = f"""[PLAN]
REQ: {task[:50] if task else '实现基础 Phaser3 功能'}
API: {', '.join(api_list[:5])}
STEPS:
1. 配置 Phaser Game 和 Scene
2. 在 create 中创建游戏对象
3. 实现交互或动画逻辑
[/PLAN]"""

    # 组合输出
    raw_output = f"""{plan_text}

```javascript
{code}
```"""

    return {
        'id': request.get('id', ''),
        'prompt_id': request.get('prompt_id', ''),
        'version': request.get('version', 1),
        'prompt_meta': prompt,
        'raw_output': raw_output,
        'output': raw_output,
        'teacher_model': 'mock',
        'api_context_injected': request.get('api_context_injected', []),
        'timestamp': datetime.now().isoformat()
    }


def run_mock_distill(
    requests_path: str,
    output_path: str,
    max_items: int = None,
    checkpoint_path: str = None
) -> int:
    """
    运行 Mock 蒸馏

    Args:
        requests_path: 请求文件路径
        output_path: 输出文件路径
        max_items: 最大处理数量
        checkpoint_path: 检查点路径

    Returns:
        处理的请求数量
    """
    logger.info(f"Loading requests from {requests_path}")
    requests = read_jsonl(requests_path)
    logger.info(f"Loaded {len(requests)} requests")

    if max_items:
        requests = requests[:max_items]
        logger.info(f"Limited to {max_items} requests")

    # 检查点
    checkpoint = Checkpoint(checkpoint_path) if checkpoint_path else None
    if checkpoint:
        logger.info(f"Resuming from checkpoint: {len(checkpoint)} processed")

    ensure_dir(output_path.rsplit('/', 1)[0] if '/' in output_path else '.')

    count = 0
    for i, request in enumerate(requests):
        req_id = request.get('id', f'req_{i}')

        if checkpoint and checkpoint.is_done(req_id):
            continue

        output = generate_mock_output(request)
        append_jsonl(output_path, output)

        if checkpoint:
            checkpoint.mark_done(req_id)
            if (i + 1) % 100 == 0:
                checkpoint.save()

        count += 1
        print_progress(i + 1, len(requests), prefix='Mock distill')

    if checkpoint:
        checkpoint.save()

    logger.info(f"Generated {count} mock outputs to {output_path}")
    return count


def main():
    parser = argparse.ArgumentParser(description='运行 Mock 教师蒸馏')
    parser.add_argument(
        '--requests', '-r',
        type=str,
        default=str(get_data_path('sft_distill/requests.jsonl')),
        help='请求文件路径'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default=str(get_data_path('sft_distill/raw_outputs.jsonl')),
        help='输出文件路径'
    )
    parser.add_argument(
        '--max-items', '-n',
        type=int,
        default=None,
        help='最大处理数量（用于测试）'
    )
    parser.add_argument(
        '--checkpoint',
        type=str,
        default=None,
        help='检查点文件路径'
    )

    args = parser.parse_args()

    count = run_mock_distill(
        requests_path=args.requests,
        output_path=args.output,
        max_items=args.max_items,
        checkpoint_path=args.checkpoint
    )

    print(f"\nMock 蒸馏完成！")
    print(f"  - 生成数量: {count}")
    print(f"  - 输出路径: {args.output}")


if __name__ == '__main__':
    main()
