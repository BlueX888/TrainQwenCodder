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
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制三角形
  triangle = this.add.graphics();
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（相对于中心点的坐标）
  triangle.fillTriangle(
    0, -20,   // 顶点
    -15, 20,  // 左下
    15, 20    // 右下
  );
  
  // 设置初始位置到屏幕中心
  triangle.setPosition(400, 300);
  
  // 添加 WASD 键盘监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算本帧移动距离（速度 * 时间，delta 单位为毫秒）
  const distance = SPEED * (delta / 1000);
  
  // 获取当前位置
  let x = triangle.x;
  let y = triangle.y;
  
  // 根据按键状态更新位置
  if (keys.w.isDown) {
    y -= distance; // 向上移动
  }
  if (keys.s.isDown) {
    y += distance; // 向下移动
  }
  if (keys.a.isDown) {
    x -= distance; // 向左移动
  }
  if (keys.d.isDown) {
    x += distance; // 向右移动
  }
  
  // 更新三角形位置
  triangle.setPosition(x, y);
}

new Phaser.Game(config);