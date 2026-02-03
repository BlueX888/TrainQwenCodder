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
const SPEED = 120; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x3498db, 1); // 蓝色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('playerSquare', 32, 32);
  graphics.destroy();

  // 创建玩家方块，放置在画布中心
  player = this.add.sprite(400, 300, 'playerSquare');

  // 设置 WASD 键位
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 添加说明文字
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算速度向量
  let velocityX = 0;
  let velocityY = 0;

  // 检测 WASD 按键状态
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

  // 归一化对角线移动速度（避免对角线移动更快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }

  // 根据 delta 时间更新位置（确保帧率无关的移动）
  // delta 单位是毫秒，需要转换为秒
  const deltaSeconds = delta / 1000;
  player.x += velocityX * SPEED * deltaSeconds;
  player.y += velocityY * SPEED * deltaSeconds;

  // 限制方块在画布范围内
  player.x = Phaser.Math.Clamp(player.x, 16, 784);
  player.y = Phaser.Math.Clamp(player.y, 16, 584);
}

new Phaser.Game(config);