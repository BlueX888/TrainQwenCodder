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
const SPEED = 360; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(40, 40, 80, 60); // 中心点(40,40)，宽80，高60
  graphics.generateTexture('ellipseTex', 80, 80);
  graphics.destroy();

  // 创建椭圆精灵，放置在屏幕中央
  ellipse = this.add.sprite(400, 300, 'ellipseTex');

  // 添加 WASD 键监听
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
  // 计算每帧移动距离 = 速度 * 时间差(秒)
  const distance = SPEED * (delta / 1000);

  // 根据按键状态移动椭圆
  if (keyW.isDown) {
    ellipse.y -= distance;
  }
  if (keyS.isDown) {
    ellipse.y += distance;
  }
  if (keyA.isDown) {
    ellipse.x -= distance;
  }
  if (keyD.isDown) {
    ellipse.x += distance;
  }

  // 边界限制（可选）
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 0, 800);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 0, 600);
}

new Phaser.Game(config);