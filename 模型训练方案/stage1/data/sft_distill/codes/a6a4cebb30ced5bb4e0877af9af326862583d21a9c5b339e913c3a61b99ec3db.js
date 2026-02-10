const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let triangle;
let cursors;
const SPEED = 360;

function preload() {
  // 使用 Graphics 生成灰色三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制一个灰色三角形（指向上方）
  graphics.fillStyle(0x808080, 1);
  graphics.beginPath();
  graphics.moveTo(25, 0);      // 顶点
  graphics.lineTo(50, 50);     // 右下角
  graphics.lineTo(0, 50);      // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，放置在画布中心
  triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置三角形的锚点为中心
  triangle.setOrigin(0.5, 0.5);
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动增量（delta 单位是毫秒，需要转换为秒）
  const deltaSeconds = delta / 1000;
  const moveDistance = SPEED * deltaSeconds;
  
  // 根据方向键输入更新位置
  let newX = triangle.x;
  let newY = triangle.y;
  
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
  
  // 限制在画布边界内（考虑三角形的尺寸）
  const halfWidth = triangle.width / 2;
  const halfHeight = triangle.height / 2;
  
  newX = Phaser.Math.Clamp(newX, halfWidth, config.width - halfWidth);
  newY = Phaser.Math.Clamp(newY, halfHeight, config.height - halfHeight);
  
  // 更新三角形位置
  triangle.setPosition(newX, newY);
}

new Phaser.Game(config);