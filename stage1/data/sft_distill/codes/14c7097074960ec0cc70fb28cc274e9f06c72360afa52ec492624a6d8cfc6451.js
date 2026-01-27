const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let ellipse;
let cursors;
const SPEED = 120;
const ELLIPSE_WIDTH = 80;
const ELLIPSE_HEIGHT = 50;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建灰色椭圆
  ellipse = this.add.graphics();
  ellipse.fillStyle(0x808080, 1); // 灰色
  ellipse.fillEllipse(0, 0, ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  
  // 设置椭圆初始位置（画布中心）
  ellipse.x = config.width / 2;
  ellipse.y = config.height / 2;
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键更新位置
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
  
  // 限制在画布边界内（考虑椭圆的半径）
  const halfWidth = ELLIPSE_WIDTH / 2;
  const halfHeight = ELLIPSE_HEIGHT / 2;
  
  if (ellipse.x - halfWidth < 0) {
    ellipse.x = halfWidth;
  }
  if (ellipse.x + halfWidth > config.width) {
    ellipse.x = config.width - halfWidth;
  }
  if (ellipse.y - halfHeight < 0) {
    ellipse.y = halfHeight;
  }
  if (ellipse.y + halfHeight > config.height) {
    ellipse.y = config.height - halfHeight;
  }
}

new Phaser.Game(config);