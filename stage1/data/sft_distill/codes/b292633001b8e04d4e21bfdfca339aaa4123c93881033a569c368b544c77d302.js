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
const SPEED = 160; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个指向上方的三角形（中心点为原点）
  graphics.fillTriangle(
    0, -20,    // 顶点
    -15, 20,   // 左下角
    15, 20     // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 30, 40);
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 设置 WASD 键
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
  // 计算移动距离：速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态移动三角形
  if (keys.w.isDown) {
    triangle.y -= distance;
  }
  if (keys.s.isDown) {
    triangle.y += distance;
  }
  if (keys.a.isDown) {
    triangle.x -= distance;
  }
  if (keys.d.isDown) {
    triangle.x += distance;
  }
  
  // 限制三角形在屏幕范围内
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);