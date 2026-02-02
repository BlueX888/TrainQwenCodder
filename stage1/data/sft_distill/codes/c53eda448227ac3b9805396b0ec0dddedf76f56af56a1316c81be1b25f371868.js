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

// 游戏对象
let player;
let keys;
const SPEED = 240; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBlock', 50, 50);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建玩家方块，初始位置在屏幕中心
  player = this.add.sprite(400, 300, 'playerBlock');

  // 绑定 WASD 键
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间间隔（转换为秒）
  const distance = SPEED * (delta / 1000);

  // 重置速度
  let velocityX = 0;
  let velocityY = 0;

  // 检测按键状态并设置速度方向
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

  // 如果同时按下多个方向键，进行归一化处理（保持对角线移动速度一致）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }

  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;

  // 边界限制（可选，防止方块移出屏幕）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

// 启动游戏
new Phaser.Game(config);