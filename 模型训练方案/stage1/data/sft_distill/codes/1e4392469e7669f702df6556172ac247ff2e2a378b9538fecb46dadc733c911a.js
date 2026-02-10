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
  // 创建 20 个黄色菱形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为黄色
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制菱形路径（32像素大小）
    // 菱形中心在原点，四个顶点分别在上下左右
    const path = new Phaser.Geom.Polygon([
      0, -16,    // 上顶点
      16, 0,     // 右顶点
      0, 16,     // 下顶点
      -16, 0     // 左顶点
    ]);
    
    // 填充路径
    graphics.fillPoints(path.points, true);
    
    // 设置随机位置（考虑边界，避免菱形超出画布）
    graphics.setRandomPosition(16, 16, 800 - 32, 600 - 32);
  }
}

new Phaser.Game(config);