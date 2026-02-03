const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let hexagon;
let cursors;
const SPEED = 200;

function preload() {
  // 创建青色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点（半径30）
  const radius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    hexPoints.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
    });
  }
  
  // 绘制六边形
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
}

function create() {
  // 创建六边形精灵，放置在画布中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（像素/秒 * 秒 = 像素）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键更新位置
  if (cursors.left.isDown) {
    hexagon.x -= distance;
  }
  if (cursors.right.isDown) {
    hexagon.x += distance;
  }
  if (cursors.up.isDown) {
    hexagon.y -= distance;
  }
  if (cursors.down.isDown) {
    hexagon.y += distance;
  }
  
  // 限制在画布边界内（考虑六边形半径30）
  const halfWidth = hexagon.width / 2;
  const halfHeight = hexagon.height / 2;
  
  hexagon.x = Phaser.Math.Clamp(hexagon.x, halfWidth, config.width - halfWidth);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);