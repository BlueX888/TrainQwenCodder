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
  // 菱形大小为 80 像素
  const size = 80;
  const halfSize = size / 2;
  
  // 创建 12 个绿色菱形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为绿色
    graphics.fillStyle(0x00ff00, 1);
    
    // 定义菱形的四个顶点（以中心为原点）
    // 顶部、右侧、底部、左侧
    const diamond = new Phaser.Geom.Polygon([
      0, -halfSize,      // 顶点
      halfSize, 0,       // 右顶点
      0, halfSize,       // 底顶点
      -halfSize, 0       // 左顶点
    ]);
    
    // 填充菱形路径
    graphics.fillPoints(diamond.points, true);
    
    // 随机设置位置（确保菱形完全在场景内）
    graphics.setRandomPosition(
      halfSize, 
      halfSize, 
      config.width - size, 
      config.height - size
    );
  }
}

new Phaser.Game(config);