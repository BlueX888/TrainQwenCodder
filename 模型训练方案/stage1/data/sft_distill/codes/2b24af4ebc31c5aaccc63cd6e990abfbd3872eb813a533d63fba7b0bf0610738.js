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
const SPEED = 80;

function preload() {
  // 使用 Graphics 生成矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('playerRect', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建玩家矩形精灵，放置在屏幕中心
  player = this.add.sprite(400, 300, 'playerRect');
  
  // 添加 WASD 键盘监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检查水平方向按键
  if (keys.a.isDown) {
    velocityX = -SPEED;
  } else if (keys.d.isDown) {
    velocityX = SPEED;
  }
  
  // 检查垂直方向按键
  if (keys.w.isDown) {
    velocityY = -SPEED;
  } else if (keys.s.isDown) {
    velocityY = SPEED;
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量
  // 避免对角线移动速度过快
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX = (velocityX / length) * SPEED;
    velocityY = (velocityY / length) * SPEED;
  }
  
  // 根据帧时间差计算实际移动距离
  const deltaSeconds = delta / 1000;
  player.x += velocityX * deltaSeconds;
  player.y += velocityY * deltaSeconds;
  
  // 限制玩家在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 20, 780);
  player.y = Phaser.Math.Clamp(player.y, 20, 580);
}

new Phaser.Game(config);