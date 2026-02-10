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
  // 菱形大小
  const diamondSize = 48;
  const halfSize = diamondSize / 2;
  
  // 绘制12个随机位置的黄色菱形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充
    graphics.fillStyle(0xffff00, 1);
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 绘制菱形的四个顶点（以中心为原点）
    // 上顶点
    graphics.moveTo(0, -halfSize);
    // 右顶点
    graphics.lineTo(halfSize, 0);
    // 下顶点
    graphics.lineTo(0, halfSize);
    // 左顶点
    graphics.lineTo(-halfSize, 0);
    
    // 闭合路径
    graphics.closePath();
    
    // 填充路径
    graphics.fillPath();
    
    // 设置随机位置（考虑菱形大小，避免超出边界）
    const randomX = Phaser.Math.Between(halfSize, config.width - halfSize);
    const randomY = Phaser.Math.Between(halfSize, config.height - halfSize);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);