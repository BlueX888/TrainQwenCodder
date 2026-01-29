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
const SPEED = 360; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  
  // 生成纹理供 sprite 使用
  graphics.generateTexture('playerBlock', 50, 50);
  graphics.destroy();
  
  // 创建玩家精灵
  player = this.add.sprite(400, 300, 'playerBlock');
  
  // 设置 WASD 键
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
  // 计算每帧的移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键状态
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
    // 对角线移动时，保持速度恒定（除以 √2）
    const normalizer = Math.sqrt(2);
    velocityX /= normalizer;
    velocityY /= normalizer;
  }
  
  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;
  
  // 边界限制（可选）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);