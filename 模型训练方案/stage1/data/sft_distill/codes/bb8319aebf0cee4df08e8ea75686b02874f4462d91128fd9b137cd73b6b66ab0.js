const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 六边形半径（约 16 像素）
  const radius = 16;
  
  // 计算六边形的六个顶点
  // 六边形每个角度间隔 60 度（2π/6）
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }
  
  // 设置填充样式为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 设置线条样式为白色（可选，用于描边）
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 移动到第一个顶点
  graphics.moveTo(points[0].x, points[0].y);
  
  // 连接其余顶点
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充和描边
  graphics.fillPath();
  graphics.strokePath();
}

new Phaser.Game(config);