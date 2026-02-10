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
  // 创建20个随机位置的黄色菱形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制菱形（32像素大小，即从中心到边缘16像素）
    graphics.beginPath();
    graphics.moveTo(0, -16);    // 上顶点
    graphics.lineTo(16, 0);     // 右顶点
    graphics.lineTo(0, 16);     // 下顶点
    graphics.lineTo(-16, 0);    // 左顶点
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（留出边距避免菱形超出画布）
    const randomX = Phaser.Math.Between(32, 768);
    const randomY = Phaser.Math.Between(32, 568);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);