const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建8个随机位置的橙色菱形
  for (let i = 0; i < 8; i++) {
    const graphics = this.add.graphics();
    
    // 设置橙色填充
    graphics.fillStyle(0xFFA500, 1);
    
    // 创建菱形路径（24像素大小，从中心到边缘12像素）
    const path = new Phaser.Geom.Polygon([
      0, -12,    // 上顶点
      12, 0,     // 右顶点
      0, 12,     // 下顶点
      -12, 0     // 左顶点
    ]);
    
    // 填充菱形路径
    graphics.fillPoints(path.points, true);
    
    // 设置随机位置（考虑边界，避免菱形超出画布）
    const x = Phaser.Math.Between(20, 780);
    const y = Phaser.Math.Between(20, 580);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);