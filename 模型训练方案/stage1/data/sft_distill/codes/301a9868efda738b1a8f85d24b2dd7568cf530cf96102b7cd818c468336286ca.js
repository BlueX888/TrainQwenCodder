const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建3个红色三角形
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置红色填充样式
    graphics.fillStyle(0xff0000, 1);
    
    // 绘制三角形（等边三角形，大小为80像素）
    // 三角形顶点坐标：顶点在上方，底边水平
    const size = 80;
    const height = (Math.sqrt(3) / 2) * size; // 等边三角形高度
    
    graphics.fillTriangle(
      0, -height / 2,           // 顶点（上）
      -size / 2, height / 2,    // 左下顶点
      size / 2, height / 2      // 右下顶点
    );
    
    // 设置随机位置（确保三角形完全在画布内）
    const margin = size / 2 + 20; // 留出边距
    graphics.setRandomPosition(
      margin, 
      margin, 
      config.width - margin * 2, 
      config.height - margin * 2
    );
  }
}

new Phaser.Game(config);