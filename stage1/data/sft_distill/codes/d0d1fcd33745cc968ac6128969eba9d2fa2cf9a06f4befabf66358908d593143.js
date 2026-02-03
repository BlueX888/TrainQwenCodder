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

let diamond;
let keys;
const SPEED = 160;

function preload() {
  // 使用 Graphics 程序化生成菱形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制菱形（四个顶点连接）
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使菱形更清晰
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，放置在屏幕中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 添加 WASD 键盘监听
  keys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the diamond', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键状态并设置速度
  if (keys.left.isDown) {
    velocityX = -SPEED;
  } else if (keys.right.isDown) {
    velocityX = SPEED;
  }
  
  if (keys.up.isDown) {
    velocityY = -SPEED;
  } else if (keys.down.isDown) {
    velocityY = SPEED;
  }
  
  // 对角线移动时归一化速度（避免速度变快）
  if (velocityX !== 0 && velocityY !== 0) {
    const factor = Math.sqrt(2) / 2; // 约 0.707
    velocityX *= factor;
    velocityY *= factor;
  }
  
  // 应用速度（根据 delta 时间计算实际移动距离）
  diamond.x += velocityX * (delta / 1000);
  diamond.y += velocityY * (delta / 1000);
  
  // 边界限制（可选）
  diamond.x = Phaser.Math.Clamp(diamond.x, 32, 768);
  diamond.y = Phaser.Math.Clamp(diamond.y, 32, 568);
}

new Phaser.Game(config);