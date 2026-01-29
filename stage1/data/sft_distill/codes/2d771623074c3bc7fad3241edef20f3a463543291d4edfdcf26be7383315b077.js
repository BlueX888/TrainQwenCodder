const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let cursors;
const SPEED = 240; // 像素/秒

function preload() {
  // 使用 Graphics 生成方块纹理，无需外部资源
}

function create() {
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBlock', 50, 50);
  graphics.destroy();

  // 创建玩家方块，放置在屏幕中心
  player = this.add.sprite(400, 300, 'playerBlock');
  player.setOrigin(0.5, 0.5);

  // 设置 WASD 键盘控制
  cursors = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);

  // 重置速度
  let velocityX = 0;
  let velocityY = 0;

  // 检测 WASD 键状态
  if (cursors.left.isDown) {
    velocityX = -1;
  } else if (cursors.right.isDown) {
    velocityX = 1;
  }

  if (cursors.up.isDown) {
    velocityY = -1;
  } else if (cursors.down.isDown) {
    velocityY = 1;
  }

  // 对角线移动时保持速度一致（归一化）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }

  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;

  // 边界限制（可选）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);