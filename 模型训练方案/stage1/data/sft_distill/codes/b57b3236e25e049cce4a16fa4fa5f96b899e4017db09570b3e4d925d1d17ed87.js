const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xFFD700, 1);
  
  // 六边形半径（从中心到顶点的距离）
  const hexRadius = 40; // 80像素大小对应半径40
  
  // 绘制8个随机位置的六边形
  for (let i = 0; i < 8; i++) {
    // 生成随机位置，确保六边形不会超出边界
    const x = Phaser.Math.Between(hexRadius + 10, 800 - hexRadius - 10);
    const y = Phaser.Math.Between(hexRadius + 10, 600 - hexRadius - 10);
    
    // 绘制六边形
    drawHexagon(graphics, x, y, hexRadius);
  }
}

/**
 * 绘制六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} centerX - 中心点 X 坐标
 * @param {number} centerY - 中心点 Y 坐标
 * @param {number} radius - 半径
 */
function drawHexagon(graphics, centerX, centerY, radius) {
  // 计算六边形的6个顶点
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    // 六边形每个角度间隔60度，从顶部开始（-90度）
    const angle = (Math.PI / 180) * (60 * i - 90);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(x, y);
  }
  
  // 开始绘制路径
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  
  // 连接所有顶点
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  
  // 闭合路径并填充
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);