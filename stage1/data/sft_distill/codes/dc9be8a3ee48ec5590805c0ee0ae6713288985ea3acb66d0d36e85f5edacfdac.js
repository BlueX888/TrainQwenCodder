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
  // 无需预加载外部资源
}

function create() {
  // 绘制8个随机位置的橙色菱形
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置橙色填充
    graphics.fillStyle(0xFFA500, 1);
    
    // 定义菱形的四个顶点（相对于中心点）
    // 菱形大小为24像素，所以从中心到顶点距离为12
    const size = 12; // 半径
    const diamond = new Phaser.Geom.Polygon([
      0, -size,      // 上顶点
      size, 0,       // 右顶点
      0, size,       // 下顶点
      -size, 0       // 左顶点
    ]);
    
    // 填充菱形路径
    graphics.fillPoints(diamond.points, true);
    
    // 设置随机位置
    // 留出边距，确保菱形完全显示在画布内
    const margin = 20;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);