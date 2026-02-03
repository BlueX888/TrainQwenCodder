const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let diamond;
let keys;
const SPEED = 300; // 像素/秒

function preload() {
  // 创建菱形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制菱形（使用路径）
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，放置在屏幕中央
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置 WASD 键盘监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the diamond', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧应移动的距离（速度 * 时间增量）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键并设置速度方向
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
  
  // 更新菱形位置
  diamond.x += velocityX * distance;
  diamond.y += velocityY * distance;
  
  // 边界限制（可选）
  diamond.x = Phaser.Math.Clamp(diamond.x, 32, 768);
  diamond.y = Phaser.Math.Clamp(diamond.y, 32, 568);
}

new Phaser.Game(config);