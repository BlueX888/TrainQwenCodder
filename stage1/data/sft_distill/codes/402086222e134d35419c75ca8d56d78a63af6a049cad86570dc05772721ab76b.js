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
const SPEED = 360; // 像素/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建方块（使用 Graphics 绘制）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  
  // 将 graphics 转换为纹理以便后续使用
  graphics.generateTexture('playerBlock', 50, 50);
  graphics.destroy();
  
  // 创建玩家精灵
  player = this.add.sprite(400, 300, 'playerBlock');
  
  // 设置键盘输入
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文字
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 计算移动距离
  const moveDistance = SPEED * deltaInSeconds;
  
  // 初始化移动向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键状态并设置速度
  if (keys.W.isDown) {
    velocityY = -1;
  } else if (keys.S.isDown) {
    velocityY = 1;
  }
  
  if (keys.A.isDown) {
    velocityX = -1;
  } else if (keys.D.isDown) {
    velocityX = 1;
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量
  if (velocityX !== 0 && velocityY !== 0) {
    // 对角线移动时保持相同速度（归一化）
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新玩家位置
  player.x += velocityX * moveDistance;
  player.y += velocityY * moveDistance;
  
  // 边界限制（可选）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);