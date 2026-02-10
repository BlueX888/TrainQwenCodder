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
  // 创建 Graphics 对象绘制三角形
  triangle = this.add.graphics();
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制一个指向上方的三角形（相对于中心点）
  triangle.fillTriangle(
    0, -20,   // 顶点（上）
    -15, 20,  // 左下顶点
    15, 20    // 右下顶点
  );
  
  // 设置初始位置在屏幕中央
  triangle.x = 400;
  triangle.y = 300;
  
  // 添加 WASD 键监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算本帧应移动的距离（速度 * 时间，delta 单位是毫秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新三角形位置
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