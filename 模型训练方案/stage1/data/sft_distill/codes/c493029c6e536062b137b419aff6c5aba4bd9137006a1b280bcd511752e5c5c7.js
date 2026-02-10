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
const SPEED = 300; // 像素/秒

function preload() {
  // 使用 Graphics 创建三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制一个指向上方的三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillTriangle(
    25, 0,   // 顶点（顶部中心）
    0, 50,   // 左下角
    50, 50   // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建三角形 Sprite，放置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 添加 WASD 键监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the triangle', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
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
  
  // 边界限制（可选）
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);