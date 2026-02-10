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
  // 循环创建10个粉色菱形
  for (let i = 0; i < 10; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充 (FFC0CB 是标准粉色)
    graphics.fillStyle(0xFFC0CB, 1);
    
    // 定义菱形的4个顶点（中心在原点，大小24像素）
    // 菱形：上、右、下、左四个顶点
    const size = 24;
    const halfSize = size / 2;
    
    const diamond = new Phaser.Geom.Polygon([
      0, -halfSize,      // 上顶点
      halfSize, 0,       // 右顶点
      0, halfSize,       // 下顶点
      -halfSize, 0       // 左顶点
    ]);
    
    // 填充菱形路径
    graphics.fillPoints(diamond.points, true);
    
    // 设置随机位置（留出边距避免菱形被裁切）
    const margin = size;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);