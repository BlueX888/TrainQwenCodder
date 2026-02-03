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
  const graphics = this.add.graphics();
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 六边形半径
  const radius = 16;
  
  // 计算六边形的 6 个顶点坐标
  // 六边形从顶部开始，顺时针绘制
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度开始，每次旋转60度
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }
  
  // 设置填充样式为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);