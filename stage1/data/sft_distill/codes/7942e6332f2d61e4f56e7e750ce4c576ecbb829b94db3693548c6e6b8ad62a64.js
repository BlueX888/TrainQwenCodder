const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let triangle;
let keys;
const SPEED = 160; // 像素/秒

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（中心点在 (0, 0)）
  graphics.fillTriangle(
    0, -20,    // 顶点
    -17, 10,   // 左下角
    17, 10     // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 40, 40);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建三角形精灵，初始位置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 绑定 WASD 键
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
  // 计算本帧移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 检测 W 键（向上）
  if (keys.w.isDown) {
    triangle.y -= distance;
  }
  
  // 检测 S 键（向下）
  if (keys.s.isDown) {
    triangle.y += distance;
  }
  
  // 检测 A 键（向左）
  if (keys.a.isDown) {
    triangle.x -= distance;
  }
  
  // 检测 D 键（向右）
  if (keys.d.isDown) {
    triangle.x += distance;
  }
  
  // 边界限制（可选，防止三角形移出屏幕）
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);