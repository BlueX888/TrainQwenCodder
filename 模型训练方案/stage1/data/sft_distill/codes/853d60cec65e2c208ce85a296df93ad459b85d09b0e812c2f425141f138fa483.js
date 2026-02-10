const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let triangle;
let keys;
const SPEED = 200; // 像素/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建三角形 Graphics 对象
  triangle = this.add.graphics();
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（以中心点为基准）
  triangle.fillTriangle(
    0, -20,    // 顶点
    -17, 10,   // 左下
    17, 10     // 右下
  );
  
  // 设置初始位置在屏幕中心
  triangle.x = 400;
  triangle.y = 300;
  
  // 创建 WASD 键位绑定
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
}

function update(time, delta) {
  // 计算本帧应移动的距离（速度 * 时间）
  // delta 单位是毫秒，需要转换为秒
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keys.W.isDown) {
    triangle.y -= distance; // 向上移动
  }
  if (keys.S.isDown) {
    triangle.y += distance; // 向下移动
  }
  if (keys.A.isDown) {
    triangle.x -= distance; // 向左移动
  }
  if (keys.D.isDown) {
    triangle.x += distance; // 向右移动
  }
  
  // 可选：限制三角形在屏幕范围内
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);