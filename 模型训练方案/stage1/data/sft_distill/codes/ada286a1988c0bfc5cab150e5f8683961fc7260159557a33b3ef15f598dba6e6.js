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
  // 创建12个绿色三角形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const triangle = this.add.graphics();
    
    // 设置绿色填充
    triangle.fillStyle(0x00ff00, 1);
    
    // 绘制三角形（16像素大小）
    // 以中心点为原点，绘制等边三角形
    const size = 16;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    triangle.fillTriangle(
      0, -height * 2/3,           // 顶点（上）
      -size/2, height * 1/3,      // 左下顶点
      size/2, height * 1/3        // 右下顶点
    );
    
    // 随机位置放置三角形
    // 留出边距，避免三角形超出画布边界
    triangle.setRandomPosition(
      size, 
      size, 
      config.width - size * 2, 
      config.height - size * 2
    );
  }
}

new Phaser.Game(config);