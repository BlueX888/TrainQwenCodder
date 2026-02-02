const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let keys;
const SPEED = 360; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBlock', 50, 50);
  graphics.destroy();

  // 创建玩家方块（使用生成的纹理）
  player = this.add.sprite(400, 300, 'playerBlock');

  // 创建 WASD 按键监听
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the block', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动向量
  let velocityX = 0;
  let velocityY = 0;

  // 检查按键状态并设置速度
  if (keys.W.isDown) {
    velocityY = -1; // 向上
  } else if (keys.S.isDown) {
    velocityY = 1; // 向下
  }

  if (keys.A.isDown) {
    velocityX = -1; // 向左
  } else if (keys.D.isDown) {
    velocityX = 1; // 向右
  }

  // 如果同时按下两个方向键，需要归一化速度（避免对角线移动过快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }

  // 根据 delta 时间更新位置（delta 单位是毫秒）
  player.x += velocityX * SPEED * (delta / 1000);
  player.y += velocityY * SPEED * (delta / 1000);

  // 边界限制（可选，防止方块移出屏幕）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);