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
  
  // 六边形半径（大小约为 16 像素）
  const radius = 16;
  
  // 计算六边形的六个顶点坐标
  // 六边形的角度间隔为 60 度（π/3 弧度）
  const vertices = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始绘制
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    vertices.push({ x, y });
  }
  
  // 设置填充样式为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 移动到第一个顶点
  graphics.moveTo(vertices[0].x, vertices[0].y);
  
  // 依次连接其他顶点
  for (let i = 1; i < vertices.length; i++) {
    graphics.lineTo(vertices[i].x, vertices[i].y);
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
  
  // 可选：添加白色描边使六边形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
}

new Phaser.Game(config);