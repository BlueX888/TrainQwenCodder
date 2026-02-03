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
const SPEED = 200; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个指向上方的三角形（中心在原点）
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
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算本帧移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态移动三角形
  if (keys.W.isDown) {
    triangle.y -= distance;
  }
  if (keys.S.isDown) {
    triangle.y += distance;
  }
  if (keys.A.isDown) {
    triangle.x -= distance;
  }
  if (keys.D.isDown) {
    triangle.x += distance;
  }
  
  // 边界限制（可选，防止移出屏幕）
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);