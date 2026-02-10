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
const SPEED = 160; // 像素/秒

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  graphics.generateTexture('ellipseTex', 80, 60);
  graphics.destroy();

  // 创建椭圆精灵
  ellipse = this.add.sprite(400, 300, 'ellipseTex');

  // 监听 WASD 键
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the ellipse', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧移动距离 = 速度 * 时间（转换为秒）
  const distance = SPEED * (delta / 1000);

  // 根据按键状态移动椭圆
  if (keys.w.isDown) {
    ellipse.y -= distance;
  }
  if (keys.s.isDown) {
    ellipse.y += distance;
  }
  if (keys.a.isDown) {
    ellipse.x -= distance;
  }
  if (keys.d.isDown) {
    ellipse.x += distance;
  }

  // 限制椭圆在画布范围内
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 0, 800);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 0, 600);
}

new Phaser.Game(config);