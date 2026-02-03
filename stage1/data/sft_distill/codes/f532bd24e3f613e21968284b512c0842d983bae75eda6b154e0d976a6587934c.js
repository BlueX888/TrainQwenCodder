const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 菱形大小
  const size = 80;
  const halfSize = size / 2;
  
  // 创建20个随机位置的灰色菱形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置灰色填充
    graphics.fillStyle(0x808080, 1);
    
    // 定义菱形的4个顶点（相对于中心点）
    // 菱形：上、右、下、左四个顶点
    const diamond = new Phaser.Geom.Polygon([
      0, -halfSize,        // 上顶点
      halfSize, 0,         // 右顶点
      0, halfSize,         // 下顶点
      -halfSize, 0         // 左顶点
    ]);
    
    // 填充菱形路径
    graphics.fillPoints(diamond.points, true);
    
    // 设置随机位置（考虑菱形大小，避免超出边界）
    const randomX = Phaser.Math.Between(halfSize, config.width - halfSize);
    const randomY = Phaser.Math.Between(halfSize, config.height - halfSize);
    graphics.setPosition(randomX, randomY);
  }
}

// 启动游戏
new Phaser.Game(config);