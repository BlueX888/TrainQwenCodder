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
  // 无需预加载资源
}

function create() {
  // 创建三角形 Graphics 对象
  triangle = this.add.graphics();
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（顶点坐标相对于 Graphics 对象的位置）
  triangle.fillTriangle(
    0, -20,    // 顶部顶点
    -15, 20,   // 左下顶点
    15, 20     // 右下顶点
  );
  
  // 设置三角形初始位置（屏幕中心）
  triangle.x = 400;
  triangle.y = 300;
  
  // 添加 WASD 键监听
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 根据按键状态更新三角形位置
  if (keys.W.isDown) {
    triangle.y -= moveDistance; // 向上移动
  }
  if (keys.S.isDown) {
    triangle.y += moveDistance; // 向下移动
  }
  if (keys.A.isDown) {
    triangle.x -= moveDistance; // 向左移动
  }
  if (keys.D.isDown) {
    triangle.x += moveDistance; // 向右移动
  }
  
  // 可选：限制三角形在屏幕范围内
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);