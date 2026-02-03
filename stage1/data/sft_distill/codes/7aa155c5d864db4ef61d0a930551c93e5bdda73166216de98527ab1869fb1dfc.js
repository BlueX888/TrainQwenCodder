const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色为灰色
  graphics.fillStyle(0x808080, 1);
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 六边形半径（从中心到顶点的距离）
  const radius = 24;
  
  // 计算六边形的六个顶点坐标
  // 六边形每个角度间隔 60 度（π/3 弧度）
  // 从顶部开始（-90度），顺时针绘制
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从-90度开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }
  
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
  
  // 填充六边形
  graphics.fillPath();
  
  // 可选：添加描边使六边形更清晰
  graphics.lineStyle(2, 0x404040, 1);
  graphics.strokePath();
}

new Phaser.Game(config);