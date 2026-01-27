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
let keys;
const SPEED = 240; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x4a90e2, 1); // 蓝色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建玩家方块，放置在屏幕中心
  player = this.add.sprite(400, 300, 'player');
  player.setOrigin(0.5, 0.5);

  // 设置 WASD 键控制
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);

  // 重置速度
  let velocityX = 0;
  let velocityY = 0;

  // 检测按键状态并设置速度方向
  if (keys.w.isDown) {
    velocityY = -1;
  } else if (keys.s.isDown) {
    velocityY = 1;
  }

  if (keys.a.isDown) {
    velocityX = -1;
  } else if (keys.d.isDown) {
    velocityX = 1;
  }

  // 对角线移动时归一化速度（避免对角线速度过快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }

  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;

  // 限制在屏幕边界内（考虑方块尺寸）
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;

  player.x = Phaser.Math.Clamp(player.x, halfWidth, 800 - halfWidth);
  player.y = Phaser.Math.Clamp(player.y, halfHeight, 600 - halfHeight);
}

new Phaser.Game(config);