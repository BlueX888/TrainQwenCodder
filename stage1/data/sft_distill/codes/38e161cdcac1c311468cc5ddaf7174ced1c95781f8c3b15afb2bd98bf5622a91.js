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
  
  // 设置青色填充颜色 (cyan: #00FFFF)
  graphics.fillStyle(0x00FFFF, 1);
  
  /**
   * 绘制六边形
   * @param {number} x - 中心点 x 坐标
   * @param {number} y - 中心点 y 坐标
   * @param {number} radius - 六边形半径（从中心到顶点的距离）
   */
  function drawHexagon(x, y, radius) {
    graphics.beginPath();
    
    // 计算六边形的6个顶点坐标
    // 从顶部开始，顺时针绘制
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // 每个角60度，起始角度-90度使顶点朝上
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
  
  // 绘制10个随机位置的六边形
  const hexagonRadius = 16; // 六边形大小为16像素
  const margin = hexagonRadius + 10; // 边距，确保六边形不会超出画布
  
  for (let i = 0; i < 10; i++) {
    // 生成随机位置，确保六边形完全在画布内
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    
    drawHexagon(randomX, randomY, hexagonRadius);
  }
}

new Phaser.Game(config);