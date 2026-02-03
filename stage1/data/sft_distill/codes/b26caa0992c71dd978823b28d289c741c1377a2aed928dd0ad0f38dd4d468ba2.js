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
const SPEED = 240; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（四个顶点）
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
  
  // 创建菱形 Sprite
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置 WASD 键盘输入
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文字
  this.add.text(10, 10, 'Use WASD to move the diamond', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 创建移动向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 WASD 按键状态
  if (keys.w.isDown) {
    velocityY = -1;
  }
  if (keys.s.isDown) {
    velocityY = 1;
  }
  if (keys.a.isDown) {
    velocityX = -1;
  }
  if (keys.d.isDown) {
    velocityX = 1;
  }
  
  // 如果有移动，归一化向量并应用速度
  if (velocityX !== 0 || velocityY !== 0) {
    const velocity = new Phaser.Math.Vector2(velocityX, velocityY);
    velocity.normalize();
    
    diamond.x += velocity.x * distance;
    diamond.y += velocity.y * distance;
  }
  
  // 限制菱形在屏幕范围内
  diamond.x = Phaser.Math.Clamp(diamond.x, 32, 768);
  diamond.y = Phaser.Math.Clamp(diamond.y, 32, 568);
}

new Phaser.Game(config);