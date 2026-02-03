const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 菱形大小
  const size = 80;
  const halfSize = size / 2;
  
  // 创建12个绿色菱形
  for (let i = 0; i < 12; i++) {
    const graphics = this.add.graphics();
    
    // 设置填充颜色为绿色
    graphics.fillStyle(0x00ff00, 1);
    
    // 创建菱形路径（中心点在原点）
    const path = new Phaser.Geom.Polygon([
      0, -halfSize,      // 上顶点
      halfSize, 0,       // 右顶点
      0, halfSize,       // 下顶点
      -halfSize, 0       // 左顶点
    ]);
    
    // 填充菱形
    graphics.fillPoints(path.points, true);
    
    // 设置随机位置（考虑边界，避免菱形超出画布）
    const x = Phaser.Math.Between(halfSize, config.width - halfSize);
    const y = Phaser.Math.Between(halfSize, config.height - halfSize);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);