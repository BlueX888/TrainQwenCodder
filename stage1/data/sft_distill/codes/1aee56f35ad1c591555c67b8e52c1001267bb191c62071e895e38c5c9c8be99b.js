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
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制六边形的辅助函数
  function drawHexagon(graphics, x, y, radius) {
    graphics.beginPath();
    
    // 计算六边形的6个顶点
    // 从顶部开始，顺时针绘制
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度开始，每60度一个顶点
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      
      if (i === 0) {
        graphics.moveTo(px, py);
      } else {
        graphics.lineTo(px, py);
      }
    }
    
    graphics.closePath();
    graphics.fillPath();
  }
  
  // 绘制12个随机位置的六边形
  const hexRadius = 16; // 大小32像素，半径为16
  const margin = 50; // 边距，确保六边形不会超出画布
  
  for (let i = 0; i < 12; i++) {
    // 生成随机位置
    const randomX = Phaser.Math.Between(margin, 800 - margin);
    const randomY = Phaser.Math.Between(margin, 600 - margin);
    
    // 绘制六边形
    drawHexagon(graphics, randomX, randomY, hexRadius);
  }
}

new Phaser.Game(config);