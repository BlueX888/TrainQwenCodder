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

let triangle;
let keys;
const SPEED = 120; // 像素/秒

function preload() {
  // 使用 Graphics 生成三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制一个指向上方的三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(25, 0);      // 顶点
  graphics.lineTo(50, 50);     // 右下角
  graphics.lineTo(0, 50);      // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，放置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangle');
  
  // 添加 WASD 键盘控制
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the triangle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算实际移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键并设置移动方向
  if (keys.w.isDown) {
    velocityY = -1; // 向上
  }
  if (keys.s.isDown) {
    velocityY = 1;  // 向下
  }
  if (keys.a.isDown) {
    velocityX = -1; // 向左
  }
  if (keys.d.isDown) {
    velocityX = 1;  // 向右
  }
  
  // 对角线移动时进行归一化，保持速度恒定
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新三角形位置
  triangle.x += velocityX * distance;
  triangle.y += velocityY * distance;
  
  // 边界限制（可选）
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);