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
  // 创建8个橙色菱形
  for (let i = 0; i < 8; i++) {
    const graphics = this.add.graphics();
    
    // 设置橙色填充
    graphics.fillStyle(0xFFA500, 1);
    
    // 绘制菱形（菱形中心在原点）
    // 菱形大小为24像素，所以半径为12像素
    const path = new Phaser.Geom.Polygon([
      0, -12,    // 上顶点
      12, 0,     // 右顶点
      0, 12,     // 下顶点
      -12, 0     // 左顶点
    ]);
    
    graphics.fillPoints(path.points, true);
    
    // 设置随机位置（考虑边界，避免菱形超出画布）
    const x = Phaser.Math.Between(20, 780);
    const y = Phaser.Math.Between(20, 580);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);