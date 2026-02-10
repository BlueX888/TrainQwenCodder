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
  // 创建20个随机位置的绿色三角形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置绿色填充样式
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制等边三角形（32像素大小）
    // 三角形顶点坐标：顶点在上方中心，底边水平
    const size = 32;
    const height = (Math.sqrt(3) / 2) * size; // 等边三角形高度
    
    // 顶点
    const x1 = 0;
    const y1 = -height / 2;
    
    // 左下角
    const x2 = -size / 2;
    const y2 = height / 2;
    
    // 右下角
    const x3 = size / 2;
    const y3 = height / 2;
    
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
    
    // 设置随机位置（确保三角形完全在画布内）
    const margin = 20;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    graphics.setPosition(randomX, randomY);
  }
}

// 启动游戏
new Phaser.Game(config);