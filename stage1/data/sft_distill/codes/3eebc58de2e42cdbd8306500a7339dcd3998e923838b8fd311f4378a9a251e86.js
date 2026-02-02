const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let ellipse;
let cursors;
const SPEED = 360;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  graphics.generateTexture('ellipseTexture', 80, 60);
  graphics.destroy();

  // 创建椭圆精灵，初始位置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTexture');

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);

  // 根据方向键状态更新位置
  if (cursors.left.isDown) {
    ellipse.x -= distance;
  }
  if (cursors.right.isDown) {
    ellipse.x += distance;
  }
  if (cursors.up.isDown) {
    ellipse.y -= distance;
  }
  if (cursors.down.isDown) {
    ellipse.y += distance;
  }

  // 限制椭圆在画布边界内
  // 椭圆宽度80，高度60，所以半宽40，半高30
  const halfWidth = 40;
  const halfHeight = 30;
  
  ellipse.x = Phaser.Math.Clamp(ellipse.x, halfWidth, config.width - halfWidth);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);