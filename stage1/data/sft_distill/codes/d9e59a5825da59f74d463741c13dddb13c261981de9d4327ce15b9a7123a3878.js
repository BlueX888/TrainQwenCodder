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
const SPEED = 200; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy();

  // 创建玩家精灵（矩形）
  player = this.add.sprite(400, 300, 'playerRect');
  player.setOrigin(0.5, 0.5);

  // 绑定 WASD 键
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算基于时间的移动距离
  const distance = SPEED * (delta / 1000);

  // 重置速度
  let velocityX = 0;
  let velocityY = 0;

  // 检测 WASD 按键状态
  if (keys.W.isDown) {
    velocityY = -1; // 向上
  }
  if (keys.S.isDown) {
    velocityY = 1; // 向下
  }
  if (keys.A.isDown) {
    velocityX = -1; // 向左
  }
  if (keys.D.isDown) {
    velocityX = 1; // 向右
  }

  // 归一化对角线移动速度
  if (velocityX !== 0 && velocityY !== 0) {
    const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= magnitude;
    velocityY /= magnitude;
  }

  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;

  // 边界限制（可选）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);