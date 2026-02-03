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
  // 创建5个橙色三角形
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置橙色填充
    graphics.fillStyle(0xff8800, 1);
    
    // 绘制等边三角形
    // 三角形顶点坐标（以中心为原点，边长16像素）
    const size = 16;
    const height = (Math.sqrt(3) / 2) * size; // 等边三角形高度
    
    // 三个顶点坐标（相对于图形中心）
    const x1 = 0;           // 顶部顶点
    const y1 = -height * 2/3;
    
    const x2 = -size / 2;   // 左下顶点
    const y2 = height * 1/3;
    
    const x3 = size / 2;    // 右下顶点
    const y3 = height * 1/3;
    
    // 填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
    
    // 随机设置位置（确保三角形完全在画布内）
    const margin = 20; // 边距
    graphics.setRandomPosition(
      margin,
      margin,
      config.width - margin * 2,
      config.height - margin * 2
    );
  }
}

new Phaser.Game(config);