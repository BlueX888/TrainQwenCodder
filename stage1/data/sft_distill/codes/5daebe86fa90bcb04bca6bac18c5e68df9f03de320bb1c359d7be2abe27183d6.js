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
const SPEED = 120;
const ELLIPSE_WIDTH = 60;
const ELLIPSE_HEIGHT = 40;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(ELLIPSE_WIDTH / 2, ELLIPSE_HEIGHT / 2, ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  graphics.generateTexture('ellipseTex', ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  graphics.destroy();

  // 创建椭圆精灵，初始位置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧的移动距离
  const moveDistance = SPEED * (delta / 1000);

  // 存储当前位置
  let newX = ellipse.x;
  let newY = ellipse.y;

  // 检测方向键并更新位置
  if (cursors.left.isDown) {
    newX -= moveDistance;
  }
  if (cursors.right.isDown) {
    newX += moveDistance;
  }
  if (cursors.up.isDown) {
    newY -= moveDistance;
  }
  if (cursors.down.isDown) {
    newY += moveDistance;
  }

  // 限制在画布边界内（考虑椭圆的半径）
  const halfWidth = ELLIPSE_WIDTH / 2;
  const halfHeight = ELLIPSE_HEIGHT / 2;
  
  ellipse.x = Phaser.Math.Clamp(newX, halfWidth, config.width - halfWidth);
  ellipse.y = Phaser.Math.Clamp(newY, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);