const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let triangle;
let keys;
const SPEED = 80; // 像素/秒

function preload() {
  // 创建三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制一个向上的三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(32, 8);  // 顶点
  graphics.lineTo(8, 56);   // 左下
  graphics.lineTo(56, 56);  // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，放置在屏幕中央
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 添加 WASD 键监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 显示提示文字
  this.add.text(10, 10, 'Use WASD to move the triangle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧的移动距离 = 速度 * 时间(秒)
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态移动三角形
  if (keys.w.isDown) {
    triangle.y -= distance; // 向上移动
  }
  if (keys.s.isDown) {
    triangle.y += distance; // 向下移动
  }
  if (keys.a.isDown) {
    triangle.x -= distance; // 向左移动
  }
  if (keys.d.isDown) {
    triangle.x += distance; // 向右移动
  }
  
  // 边界限制（可选，防止三角形移出屏幕）
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);