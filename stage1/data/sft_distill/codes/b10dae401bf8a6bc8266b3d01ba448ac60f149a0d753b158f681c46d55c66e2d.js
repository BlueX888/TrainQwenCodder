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
  
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置紫色填充样式 (紫色 RGB: 128, 0, 128)
  graphics.fillStyle(0x800080, 1);
  
  // 计算菱形四个顶点坐标
  // 菱形是一个旋转45度的正方形，对角线长度为48像素
  const halfSize = 24; // 从中心到顶点的距离
  
  // 菱形顶点：上、右、下、左
  const points = [
    centerX, centerY - halfSize,  // 上顶点
    centerX + halfSize, centerY,  // 右顶点
    centerX, centerY + halfSize,  // 下顶点
    centerX - halfSize, centerY   // 左顶点
  ];
  
  // 创建多边形并填充
  const polygon = new Phaser.Geom.Polygon(points);
  graphics.fillPoints(polygon.points, true);
}

new Phaser.Game(config);