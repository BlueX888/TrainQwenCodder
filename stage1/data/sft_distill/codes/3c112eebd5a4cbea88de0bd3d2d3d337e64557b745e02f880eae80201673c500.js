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
  graphics.fillStyle(0x00ff00, 1); // 绿色椭圆
  graphics.fillEllipse(50, 50, 80, 50); // 在 (50,50) 位置绘制 80x50 的椭圆
  graphics.generateTexture('ellipseTexture', 100, 100);
  graphics.destroy();

  // 创建椭圆精灵并设置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTexture');

  // 监听 WASD 键
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算速度向量
  let velocityX = 0;
  let velocityY = 0;

  // 检测按键状态并设置速度
  if (keys.a.isDown) {
    velocityX = -SPEED;
  } else if (keys.d.isDown) {
    velocityX = SPEED;
  }

  if (keys.w.isDown) {
    velocityY = -SPEED;
  } else if (keys.s.isDown) {
    velocityY = SPEED;
  }

  // 处理对角线移动时的速度归一化
  if (velocityX !== 0 && velocityY !== 0) {
    const factor = Math.sqrt(2) / 2; // 约 0.707
    velocityX *= factor;
    velocityY *= factor;
  }

  // 根据 delta 时间更新位置（delta 单位是毫秒）
  ellipse.x += velocityX * (delta / 1000);
  ellipse.y += velocityY * (delta / 1000);

  // 限制椭圆在画布范围内
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 0, 800);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 0, 600);
}

new Phaser.Game(config);