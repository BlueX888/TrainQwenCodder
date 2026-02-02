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
  // 计算画布中心点
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 菱形大小（从中心到顶点的距离）
  const size = 48;
  
  // 计算菱形的四个顶点坐标
  // 上顶点
  const top = { x: centerX, y: centerY - size / 2 };
  // 右顶点
  const right = { x: centerX + size / 2, y: centerY };
  // 下顶点
  const bottom = { x: centerX, y: centerY + size / 2 };
  // 左顶点
  const left = { x: centerX - size / 2, y: centerY };
  
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置紫色填充（紫色 RGB: 128, 0, 128）
  graphics.fillStyle(0x800080, 1);
  
  // 创建菱形路径并填充
  const diamond = new Phaser.Geom.Polygon([
    top.x, top.y,
    right.x, right.y,
    bottom.x, bottom.y,
    left.x, left.y
  ]);
  
  graphics.fillPoints(diamond.points, true);
}

new Phaser.Game(config);