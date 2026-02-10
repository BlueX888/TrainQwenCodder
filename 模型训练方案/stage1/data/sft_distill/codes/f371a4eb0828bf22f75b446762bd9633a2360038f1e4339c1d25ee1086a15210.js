const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 160;
const ELLIPSE_WIDTH = 60;
const ELLIPSE_HEIGHT = 40;

function preload() {
  // 使用 Graphics 创建青色椭圆纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillEllipse(ELLIPSE_WIDTH / 2, ELLIPSE_HEIGHT / 2, ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  graphics.generateTexture('ellipse', ELLIPSE_WIDTH, ELLIPSE_HEIGHT);
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵，放置在画布中心
  player = this.add.sprite(400, 300, 'ellipse');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, '使用方向键控制青色椭圆移动', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间增量，转换为秒）
  const moveDistance = SPEED * (delta / 1000);
  
  // 当前位置
  let newX = player.x;
  let newY = player.y;
  
  // 根据方向键状态更新位置
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
  
  newX = Phaser.Math.Clamp(newX, halfWidth, config.width - halfWidth);
  newY = Phaser.Math.Clamp(newY, halfHeight, config.height - halfHeight);
  
  // 应用新位置
  player.setPosition(newX, newY);
}

new Phaser.Game(config);