const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let hexagon;
let cursors;
const speed = 300;

function preload() {
  // 使用 Graphics 生成黄色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点（半径为 30）
  const radius = 30;
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    points.push({ x, y });
  }
  
  // 绘制黄色六边形
  graphics.fillStyle(0xffff00, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
}

function create() {
  // 创建六边形精灵，初始位置在画布中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间增量转换为秒）
  const distance = speed * (delta / 1000);
  
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
  
  // 边界限制（考虑六边形的半径）
  const halfWidth = hexagon.width / 2;
  const halfHeight = hexagon.height / 2;
  
  hexagon.x = Phaser.Math.Clamp(hexagon.x, halfWidth, config.width - halfWidth);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);