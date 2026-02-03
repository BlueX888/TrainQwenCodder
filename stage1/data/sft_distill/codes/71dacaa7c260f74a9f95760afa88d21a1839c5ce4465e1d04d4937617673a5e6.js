const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  const diamondSize = 48;
  const pink = 0xff69b4;
  
  // 创建8个随机位置的粉色菱形
  for (let i = 0; i < 8; i++) {
    const graphics = this.add.graphics();
    
    // 设置填充颜色为粉色
    graphics.fillStyle(pink, 1);
    
    // 绘制菱形（四个顶点）
    // 菱形中心在(0,0)，顶点分别在上下左右
    const halfSize = diamondSize / 2;
    const diamond = new Phaser.Geom.Polygon([
      0, -halfSize,           // 上顶点
      halfSize, 0,            // 右顶点
      0, halfSize,            // 下顶点
      -halfSize, 0            // 左顶点
    ]);
    
    // 填充菱形路径
    graphics.fillPoints(diamond.points, true);
    
    // 设置随机位置（考虑边界，避免菱形超出画布）
    const randomX = Phaser.Math.Between(halfSize, 800 - halfSize);
    const randomY = Phaser.Math.Between(halfSize, 600 - halfSize);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);