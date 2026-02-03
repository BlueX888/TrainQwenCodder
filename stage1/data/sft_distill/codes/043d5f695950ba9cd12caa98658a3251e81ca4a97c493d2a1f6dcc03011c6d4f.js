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
  // 菱形大小
  const size = 48;
  const halfSize = size / 2;
  
  // 创建8个随机位置的粉色菱形
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充
    graphics.fillStyle(0xff69b4, 1);
    
    // 定义菱形的4个顶点（相对于中心点）
    // 菱形：上、右、下、左
    const diamond = new Phaser.Geom.Polygon([
      0, -halfSize,      // 上顶点
      halfSize, 0,       // 右顶点
      0, halfSize,       // 下顶点
      -halfSize, 0       // 左顶点
    ]);
    
    // 填充菱形路径
    graphics.fillPoints(diamond.points, true);
    
    // 设置随机位置（考虑边界，避免菱形超出画布）
    const randomX = Phaser.Math.Between(halfSize, config.width - halfSize);
    const randomY = Phaser.Math.Between(halfSize, config.height - halfSize);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);