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
  // 创建8个随机位置的绿色三角形
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置绿色填充
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制等边三角形（大小为16像素）
    // 三角形的三个顶点坐标（以中心为原点）
    const size = 16;
    const height = size * Math.sqrt(3) / 2; // 等边三角形的高
    
    // 顶点坐标（相对于图形中心）
    const x1 = 0;           // 顶部顶点
    const y1 = -height * 2 / 3;
    const x2 = -size / 2;   // 左下顶点
    const y2 = height / 3;
    const x3 = size / 2;    // 右下顶点
    const y3 = height / 3;
    
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
    
    // 设置随机位置（确保三角形完全在画布内）
    const margin = size;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    graphics.setPosition(randomX, randomY);
  }
}

// 启动游戏
new Phaser.Game(config);