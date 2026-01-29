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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBox', 50, 50);
  graphics.destroy();

  // 创建玩家方块
  player = this.add.image(400, 300, 'playerBox');

  // 设置 WASD 键位
  cursors = {
    w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);

  // 重置速度
  let velocityX = 0;
  let velocityY = 0;

  // 检测 WASD 按键
  if (cursors.w.isDown) {
    velocityY = -1;
  } else if (cursors.s.isDown) {
    velocityY = 1;
  }

  if (cursors.a.isDown) {
    velocityX = -1;
  } else if (cursors.d.isDown) {
    velocityX = 1;
  }

  // 归一化对角线移动速度
  if (velocityX !== 0 && velocityY !== 0) {
    velocityX *= Math.SQRT1_2;
    velocityY *= Math.SQRT1_2;
  }

  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;

  // 边界检测（考虑方块大小）
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;

  player.x = Phaser.Math.Clamp(player.x, halfWidth, config.width - halfWidth);
  player.y = Phaser.Math.Clamp(player.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);