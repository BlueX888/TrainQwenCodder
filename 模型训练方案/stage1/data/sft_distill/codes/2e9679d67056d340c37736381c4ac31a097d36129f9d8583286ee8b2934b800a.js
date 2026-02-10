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
  // 无需预加载外部资源
}

function create() {
  // 创建12个青色三角形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为青色
    graphics.fillStyle(0x00ffff, 1);
    
    // 绘制等边三角形，大小为16像素
    // 计算三角形的三个顶点坐标（以中心为原点）
    const size = 16;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    // 三个顶点：顶部、左下、右下
    const x1 = 0;
    const y1 = -height * 2 / 3; // 顶点
    const x2 = -size / 2;
    const y2 = height / 3; // 左下
    const x3 = size / 2;
    const y3 = height / 3; // 右下
    
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
    
    // 随机设置位置（留出边距避免三角形超出画布）
    const margin = 20;
    graphics.setRandomPosition(
      margin,
      margin,
      config.width - margin * 2,
      config.height - margin * 2
    );
  }
}

new Phaser.Game(config);