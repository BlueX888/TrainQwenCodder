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

let circle;
let keys;
const SPEED = 160; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(20, 20, 20); // 在 (20, 20) 位置绘制半径为 20 的圆
  graphics.generateTexture('circle', 40, 40);
  graphics.destroy();

  // 创建圆形精灵，放置在屏幕中心
  circle = this.add.sprite(400, 300, 'circle');

  // 监听 WASD 键
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the circle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动向量
  let velocityX = 0;
  let velocityY = 0;

  // 检查按键状态并设置速度方向
  if (keys.w.isDown) {
    velocityY = -1;
  } else if (keys.s.isDown) {
    velocityY = 1;
  }

  if (keys.a.isDown) {
    velocityX = -1;
  } else if (keys.d.isDown) {
    velocityX = 1;
  }

  // 归一化对角线移动速度（避免对角线移动过快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }

  // 应用速度，delta 是以毫秒为单位，转换为秒
  circle.x += velocityX * SPEED * (delta / 1000);
  circle.y += velocityY * SPEED * (delta / 1000);

  // 限制圆形在屏幕范围内
  circle.x = Phaser.Math.Clamp(circle.x, 20, 780);
  circle.y = Phaser.Math.Clamp(circle.y, 20, 580);
}

new Phaser.Game(config);