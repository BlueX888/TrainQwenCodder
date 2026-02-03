const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 椭圆对象引用
let ellipse;
// 键盘输入对象
let keys;
// 移动速度（像素/秒）
const SPEED = 120;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制椭圆
  ellipse = this.add.graphics();
  ellipse.fillStyle(0x00ff00, 1); // 绿色填充
  ellipse.fillEllipse(0, 0, 60, 40); // 在本地坐标 (0,0) 绘制椭圆，宽60高40
  
  // 设置椭圆初始位置到屏幕中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 添加 WASD 键盘监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧应移动的距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 根据按键状态更新位置
  if (keys.w.isDown) {
    ellipse.y -= moveDistance; // 向上移动
  }
  if (keys.s.isDown) {
    ellipse.y += moveDistance; // 向下移动
  }
  if (keys.a.isDown) {
    ellipse.x -= moveDistance; // 向左移动
  }
  if (keys.d.isDown) {
    ellipse.x += moveDistance; // 向右移动
  }
  
  // 边界限制（可选，防止椭圆移出屏幕）
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 0, 800);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 0, 600);
}

new Phaser.Game(config);