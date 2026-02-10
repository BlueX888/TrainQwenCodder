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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 生成椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色椭圆
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40, 30)，宽80，高60
  graphics.generateTexture('ellipseTex', 80, 60);
  graphics.destroy();

  // 创建椭圆精灵，放置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');

  // 添加 WASD 键盘控制
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间间隔(秒)
  const distance = SPEED * (delta / 1000);

  // 重置速度
  let velocityX = 0;
  let velocityY = 0;

  // 根据按键状态设置移动方向
  if (keys.w.isDown) {
    velocityY = -1; // 向上
  }
  if (keys.s.isDown) {
    velocityY = 1; // 向下
  }
  if (keys.a.isDown) {
    velocityX = -1; // 向左
  }
  if (keys.d.isDown) {
    velocityX = 1; // 向右
  }

  // 对角线移动时归一化速度（避免速度变快）
  if (velocityX !== 0 && velocityY !== 0) {
    const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= magnitude;
    velocityY /= magnitude;
  }

  // 更新椭圆位置
  ellipse.x += velocityX * distance;
  ellipse.y += velocityY * distance;

  // 边界限制（可选）
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 40, 760);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 30, 570);
}

new Phaser.Game(config);