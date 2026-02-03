const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipse;
let keys;
const SPEED = 360; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色椭圆
  graphics.fillEllipse(40, 30, 80, 60); // 在 (40, 30) 处绘制 80x60 的椭圆
  graphics.generateTexture('ellipseTex', 80, 60);
  graphics.destroy();

  // 创建椭圆精灵，放置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');

  // 设置 WASD 键监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the ellipse', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离（速度 * 时间差，delta 单位是毫秒）
  const distance = SPEED * (delta / 1000);

  // 根据按键状态更新椭圆位置
  if (keys.w.isDown) {
    ellipse.y -= distance; // 向上移动
  }
  if (keys.s.isDown) {
    ellipse.y += distance; // 向下移动
  }
  if (keys.a.isDown) {
    ellipse.x -= distance; // 向左移动
  }
  if (keys.d.isDown) {
    ellipse.x += distance; // 向右移动
  }

  // 可选：限制椭圆在画布范围内
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 0, 800);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 0, 600);
}

new Phaser.Game(config);