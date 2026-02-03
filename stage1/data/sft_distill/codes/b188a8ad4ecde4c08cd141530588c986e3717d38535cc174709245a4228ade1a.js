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
  // 创建8个红色菱形
  for (let i = 0; i < 8; i++) {
    const graphics = this.add.graphics();
    
    // 设置红色填充
    graphics.fillStyle(0xff0000, 1);
    
    // 绘制菱形（大小16像素，即从中心点到边缘8像素）
    // 菱形的四个顶点：上、右、下、左
    graphics.beginPath();
    graphics.moveTo(0, -8);  // 上顶点
    graphics.lineTo(8, 0);   // 右顶点
    graphics.lineTo(0, 8);   // 下顶点
    graphics.lineTo(-8, 0);  // 左顶点
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（考虑菱形大小，避免超出边界）
    const randomX = Phaser.Math.Between(8, 792);
    const randomY = Phaser.Math.Between(8, 592);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);