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
const SPEED = 120;
const ELLIPSE_WIDTH = 60;
const ELLIPSE_HEIGHT = 40;

function preload() {
  // 使用 Graphics 创建绿色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(ELLIPSE_WIDTH / 2, ELLIPSE_HEIGHT / 2, ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  graphics.generateTexture('ellipseTex', ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵，初始位置在画布中心
  ellipse = this.add.sprite(
    config.width / 2,
    config.height / 2,
    'ellipseTex'
  );

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（基于时间增量，确保帧率独立）
  const moveDistance = SPEED * (delta / 1000);

  // 根据方向键输入更新位置
  if (cursors.left.isDown) {
    ellipse.x -= moveDistance;
  }
  if (cursors.right.isDown) {
    ellipse.x += moveDistance;
  }
  if (cursors.up.isDown) {
    ellipse.y -= moveDistance;
  }
  if (cursors.down.isDown) {
    ellipse.y += moveDistance;
  }

  // 限制椭圆位置在画布边界内
  // 考虑椭圆的半径（宽度和高度的一半）
  ellipse.x = Phaser.Math.Clamp(
    ellipse.x,
    ELLIPSE_WIDTH / 2,
    config.width - ELLIPSE_WIDTH / 2
  );
  
  ellipse.y = Phaser.Math.Clamp(
    ellipse.y,
    ELLIPSE_HEIGHT / 2,
    config.height - ELLIPSE_HEIGHT / 2
  );
}

new Phaser.Game(config);