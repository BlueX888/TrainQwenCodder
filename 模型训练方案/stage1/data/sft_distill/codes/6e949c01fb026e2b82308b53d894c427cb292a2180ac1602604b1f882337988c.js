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
  // 绘制10个随机位置的灰色六边形
  for (let i = 0; i < 10; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置灰色填充
    graphics.fillStyle(0x808080, 1);
    
    // 六边形参数
    const radius = 16; // 大小32像素，半径16像素
    const sides = 6;
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 计算六边形的6个顶点并绘制
    for (let j = 0; j < sides; j++) {
      // 计算角度（从顶部开始，逆时针）
      const angle = (Math.PI / 3) * j - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      if (j === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    // 闭合路径并填充
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（考虑边界，避免六边形超出画布）
    const randomX = Phaser.Math.Between(radius + 10, 800 - radius - 10);
    const randomY = Phaser.Math.Between(radius + 10, 600 - radius - 10);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);