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
  // 获取画布中心坐标
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 菱形半径（从中心到顶点的距离）
  const size = 24;
  
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置紫色填充 (0x800080 是标准紫色)
  graphics.fillStyle(0x800080, 1);
  
  // 定义菱形的四个顶点坐标
  // 顶点：上、右、下、左
  const points = [
    centerX, centerY - size,  // 上顶点
    centerX + size, centerY,  // 右顶点
    centerX, centerY + size,  // 下顶点
    centerX - size, centerY   // 左顶点
  ];
  
  // 创建多边形并填充
  const polygon = new Phaser.Geom.Polygon(points);
  graphics.fillPoints(polygon.points, true);
}

new Phaser.Game(config);