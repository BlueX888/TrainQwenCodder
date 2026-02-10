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
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  /**
   * 绘制六边形
   * @param {number} x - 中心点 x 坐标
   * @param {number} y - 中心点 y 坐标
   * @param {number} radius - 六边形半径（中心到顶点距离）
   */
  function drawHexagon(x, y, radius) {
    graphics.beginPath();
    
    // 计算六边形的6个顶点
    // 从顶部开始，顺时针绘制
    for (let i = 0; i < 6; i++) {
      // 每个角度为 60 度（Math.PI / 3）
      // 起始角度为 -90 度，使第一个顶点在正上方
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const vx = x + radius * Math.cos(angle);
      const vy = y + radius * Math.sin(angle);
      
      if (i === 0) {
        graphics.moveTo(vx, vy);
      } else {
        graphics.lineTo(vx, vy);
      }
    }
    
    graphics.closePath();
    graphics.fillPath();
  }
  
  // 六边形大小为 80 像素（直径），半径为 40
  const hexRadius = 40;
  
  // 绘制8个随机位置的六边形
  for (let i = 0; i < 8; i++) {
    // 生成随机位置，确保六边形完全在画布内
    const randomX = hexRadius + Math.random() * (800 - 2 * hexRadius);
    const randomY = hexRadius + Math.random() * (600 - 2 * hexRadius);
    
    drawHexagon(randomX, randomY, hexRadius);
  }
}

new Phaser.Game(config);