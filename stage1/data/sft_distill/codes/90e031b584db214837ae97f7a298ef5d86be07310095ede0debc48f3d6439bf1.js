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
  // 三角形大小
  const size = 16;
  
  // 创建 12 个随机位置的绿色三角形
  for (let i = 0; i < 12; i++) {
    const graphics = this.add.graphics();
    
    // 设置绿色填充
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制等边三角形（顶点朝上）
    // 三角形的三个顶点坐标
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    graphics.fillTriangle(
      0, -height * 2 / 3,           // 顶点（顶部）
      -size / 2, height / 3,         // 左下顶点
      size / 2, height / 3           // 右下顶点
    );
    
    // 设置随机位置（留出边距避免三角形超出边界）
    const margin = size;
    graphics.setRandomPosition(
      margin,
      margin,
      config.width - margin * 2,
      config.height - margin * 2
    );
  }
}

new Phaser.Game(config);