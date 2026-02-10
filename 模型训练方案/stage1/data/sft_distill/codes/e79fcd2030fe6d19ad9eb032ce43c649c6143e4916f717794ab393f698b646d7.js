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
  // 创建5个随机位置的橙色三角形
  for (let i = 0; i < 5; i++) {
    const graphics = this.add.graphics();
    
    // 设置橙色填充
    graphics.fillStyle(0xFFA500, 1);
    
    // 绘制等边三角形（大小16像素）
    // 三角形顶点坐标：顶部中心点为原点
    const size = 16;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    graphics.fillTriangle(
      0, -height * 2/3,           // 顶点（居中）
      -size / 2, height * 1/3,    // 左下顶点
      size / 2, height * 1/3      // 右下顶点
    );
    
    // 设置随机位置（确保三角形在画布范围内）
    graphics.setRandomPosition(
      size, 
      size, 
      config.width - size * 2, 
      config.height - size * 2
    );
  }
}

new Phaser.Game(config);