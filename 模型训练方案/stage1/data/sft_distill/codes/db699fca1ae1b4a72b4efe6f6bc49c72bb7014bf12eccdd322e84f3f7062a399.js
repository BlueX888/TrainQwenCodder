const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipse;
let keys;
const SPEED = 300; // 像素/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建椭圆图形
  ellipse = this.add.graphics();
  ellipse.fillStyle(0x00ff00, 1);
  ellipse.fillEllipse(0, 0, 60, 40); // 中心点为 (0,0)，宽60，高40
  
  // 设置初始位置到屏幕中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 添加 WASD 键监听
  keys = {
    w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
}

function update(time, delta) {
  // delta 是毫秒，转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算移动距离
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
  
  // 边界限制（可选）
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 0, 800);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 0, 600);
}

new Phaser.Game(config);