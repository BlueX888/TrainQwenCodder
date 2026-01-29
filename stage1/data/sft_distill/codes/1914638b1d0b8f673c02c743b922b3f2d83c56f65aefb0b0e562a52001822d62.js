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
let cursors;
const SPEED = 360;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillEllipse(40, 30, 80, 60); // 在 (40, 30) 位置绘制 80x60 的椭圆
  graphics.generateTexture('ellipseTexture', 80, 60);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建椭圆精灵，初始位置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTexture');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间增量，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键输入更新位置
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
  // 考虑椭圆的宽度和高度（80x60）
  const halfWidth = ellipse.width / 2;
  const halfHeight = ellipse.height / 2;
  
  ellipse.x = Phaser.Math.Clamp(ellipse.x, halfWidth, config.width - halfWidth);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);