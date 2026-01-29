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
const ELLIPSE_WIDTH = 60;
const ELLIPSE_HEIGHT = 40;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillEllipse(ELLIPSE_WIDTH / 2, ELLIPSE_HEIGHT / 2, ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  graphics.generateTexture('blueEllipse', ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  graphics.destroy();

  // 创建椭圆精灵，放置在画布中心
  ellipse = this.add.sprite(400, 300, 'blueEllipse');

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;

  // 计算移动距离
  const distance = SPEED * deltaSeconds;

  // 重置速度
  let velocityX = 0;
  let velocityY = 0;

  // 检测方向键并设置速度
  if (cursors.left.isDown) {
    velocityX = -1;
  } else if (cursors.right.isDown) {
    velocityX = 1;
  }

  if (cursors.up.isDown) {
    velocityY = -1;
  } else if (cursors.down.isDown) {
    velocityY = 1;
  }

  // 如果同时按下两个方向键，需要归一化速度向量
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }

  // 更新椭圆位置
  ellipse.x += velocityX * distance;
  ellipse.y += velocityY * distance;

  // 限制在画布边界内（考虑椭圆的半径）
  const halfWidth = ELLIPSE_WIDTH / 2;
  const halfHeight = ELLIPSE_HEIGHT / 2;

  if (ellipse.x - halfWidth < 0) {
    ellipse.x = halfWidth;
  } else if (ellipse.x + halfWidth > config.width) {
    ellipse.x = config.width - halfWidth;
  }

  if (ellipse.y - halfHeight < 0) {
    ellipse.y = halfHeight;
  } else if (ellipse.y + halfHeight > config.height) {
    ellipse.y = config.height - halfHeight;
  }
}

new Phaser.Game(config);