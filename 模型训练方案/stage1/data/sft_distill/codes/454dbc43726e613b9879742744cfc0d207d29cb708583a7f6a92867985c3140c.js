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

let hexagon;
let cursors;
const SPEED = 200;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建橙色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点（半径为30）
  const radius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    hexPoints.push(x, y);
  }
  
  // 绘制橙色六边形
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.fillPolygon(hexPoints);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建六边形精灵，放在画布中心
  hexagon = this.add.sprite(
    config.width / 2,
    config.height / 2,
    'hexagon'
  );
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键移动
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
  
  // 限制在画布边界内（考虑六边形的半径）
  const halfWidth = hexagon.width / 2;
  const halfHeight = hexagon.height / 2;
  
  hexagon.x = Phaser.Math.Clamp(
    hexagon.x,
    halfWidth,
    config.width - halfWidth
  );
  
  hexagon.y = Phaser.Math.Clamp(
    hexagon.y,
    halfHeight,
    config.height - halfHeight
  );
}

new Phaser.Game(config);