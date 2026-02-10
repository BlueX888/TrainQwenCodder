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
let keyW, keyA, keyS, keyD;
const SPEED = 160; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色椭圆
  graphics.fillEllipse(40, 40, 80, 60); // 在 (40,40) 位置绘制 80x60 的椭圆
  graphics.generateTexture('ellipseTex', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理

  // 创建椭圆精灵，放置在屏幕中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');

  // 添加 WASD 键盘输入
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the ellipse', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算实际移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);

  // 根据按键状态更新椭圆位置
  if (keyW.isDown) {
    ellipse.y -= distance; // 向上移动
  }
  if (keyS.isDown) {
    ellipse.y += distance; // 向下移动
  }
  if (keyA.isDown) {
    ellipse.x -= distance; // 向左移动
  }
  if (keyD.isDown) {
    ellipse.x += distance; // 向右移动
  }

  // 限制椭圆在屏幕范围内
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 40, 760);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 30, 570);
}

new Phaser.Game(config);