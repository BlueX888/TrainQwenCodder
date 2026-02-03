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
  // 创建20个随机位置的蓝色三角形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置蓝色填充
    graphics.fillStyle(0x0000ff, 1);
    
    // 绘制等边三角形（大小16像素）
    // 等边三角形的顶点坐标（中心在原点）
    const size = 16;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    // 三个顶点坐标（顶点朝上）
    const x1 = 0;
    const y1 = -height * 2 / 3; // 顶点
    const x2 = -size / 2;
    const y2 = height / 3; // 左下角
    const x3 = size / 2;
    const y3 = height / 3; // 右下角
    
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
    
    // 设置随机位置（确保三角形完全在画布内）
    const randomX = Phaser.Math.Between(size, config.width - size);
    const randomY = Phaser.Math.Between(size, config.height - size);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);