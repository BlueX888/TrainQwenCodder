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
  // 获取画布中心点
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 六边形半径
  const radius = 16;
  
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 计算六边形的 6 个顶点坐标
  const points = [];
  for (let i = 0; i < 6; i++) {
    // 从顶部开始绘制（-90度），每个角度间隔 60 度
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 创建多边形
  const hexagon = new Phaser.Geom.Polygon(points);
  
  // 设置填充样式为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 填充六边形
  graphics.fillPoints(hexagon.points, true);
  
  // 可选：添加描边使六边形更清晰
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePoints(hexagon.points, true);
}

new Phaser.Game(config);