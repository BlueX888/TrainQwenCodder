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

let ellipse;
let keys;
const SPEED = 80; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  graphics.generateTexture('ellipseTex', 80, 60);
  graphics.destroy();

  // 创建椭圆精灵，放置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');

  // 设置 WASD 键盘控制
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 添加提示文字
  this.add.text(10, 10, 'Use WASD to move the ellipse', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算基于帧时间的实际移动距离
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

  // 边界限制（可选）
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 40, 760);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 30, 570);
}

new Phaser.Game(config);