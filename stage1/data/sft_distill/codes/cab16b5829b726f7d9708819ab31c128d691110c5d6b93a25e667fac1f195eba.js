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
  // 菱形大小
  const diamondSize = 48;
  const halfSize = diamondSize / 2;
  
  // 绘制12个随机位置的黄色菱形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充
    graphics.fillStyle(0xffff00, 1);
    
    // 定义菱形的4个顶点（相对于中心点）
    // 上、右、下、左
    const diamond = new Phaser.Geom.Polygon([
      0, -halfSize,      // 上顶点
      halfSize, 0,       // 右顶点
      0, halfSize,       // 下顶点
      -halfSize, 0       // 左顶点
    ]);
    
    // 填充菱形路径
    graphics.fillPoints(diamond.points, true);
    
    // 设置随机位置（考虑边界，留出菱形大小的边距）
    const randomX = Phaser.Math.Between(halfSize, 800 - halfSize);
    const randomY = Phaser.Math.Between(halfSize, 600 - halfSize);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);