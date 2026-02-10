const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 3 个红色三角形
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置红色填充
    graphics.fillStyle(0xff0000, 1);
    
    // 绘制等边三角形（边长 80 像素）
    // 三角形中心在原点，顶点向上
    const size = 80;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    // 三个顶点坐标（相对于中心点）
    const x1 = 0;           // 顶部顶点
    const y1 = -height * 2/3;
    
    const x2 = -size / 2;   // 左下顶点
    const y2 = height * 1/3;
    
    const x3 = size / 2;    // 右下顶点
    const y3 = height * 1/3;
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
    
    // 设置随机位置（考虑边界，避免三角形超出画布）
    const margin = 60; // 留出边距
    graphics.setRandomPosition(
      margin,
      margin,
      config.width - margin * 2,
      config.height - margin * 2
    );
  }
}

new Phaser.Game(config);