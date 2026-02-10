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
  const diamondSize = 80; // 菱形大小
  const halfSize = diamondSize / 2;
  
  // 创建12个随机位置的绿色菱形
  for (let i = 0; i < 12; i++) {
    const graphics = this.add.graphics();
    
    // 设置绿色填充
    graphics.fillStyle(0x00ff00, 1);
    
    // 定义菱形的4个顶点（以中心为原点）
    const diamond = [
      { x: 0, y: -halfSize },      // 上顶点
      { x: halfSize, y: 0 },       // 右顶点
      { x: 0, y: halfSize },       // 下顶点
      { x: -halfSize, y: 0 }       // 左顶点
    ];
    
    // 绘制并填充菱形
    graphics.beginPath();
    graphics.moveTo(diamond[0].x, diamond[0].y);
    for (let j = 1; j < diamond.length; j++) {
      graphics.lineTo(diamond[j].x, diamond[j].y);
    }
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（考虑边界，避免菱形超出画布）
    const randomX = Phaser.Math.Between(halfSize, config.width - halfSize);
    const randomY = Phaser.Math.Between(halfSize, config.height - halfSize);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);