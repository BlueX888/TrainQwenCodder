const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充样式为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 设置描边样式（可选，让六边形更清晰）
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 六边形半径
  const radius = 16;
  
  // 计算六边形的 6 个顶点
  // 六边形的顶点角度为 0°, 60°, 120°, 180°, 240°, 300°
  // 从顶部开始绘制（-90° 或 -Math.PI/2）
  const vertices = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 60度间隔，从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    vertices.push({ x, y });
  }
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 移动到第一个顶点
  graphics.moveTo(vertices[0].x, vertices[0].y);
  
  // 连接其余顶点
  for (let i = 1; i < vertices.length; i++) {
    graphics.lineTo(vertices[i].x, vertices[i].y);
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充并描边
  graphics.fillPath();
  graphics.strokePath();
}

new Phaser.Game(config);