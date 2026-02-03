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
  
  // 设置紫色填充
  graphics.fillStyle(0x9966ff, 1);
  
  // 六边形半径（从中心到顶点的距离）
  const hexRadius = 32; // 64像素大小的六边形半径为32
  
  // 绘制六边形的辅助函数
  function drawHexagon(gfx, x, y, radius) {
    gfx.beginPath();
    
    // 计算六边形的6个顶点（从顶部开始，顺时针）
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度起始，使顶点朝上
      const vx = x + radius * Math.cos(angle);
      const vy = y + radius * Math.sin(angle);
      
      if (i === 0) {
        gfx.moveTo(vx, vy);
      } else {
        gfx.lineTo(vx, vy);
      }
    }
    
    gfx.closePath();
    gfx.fillPath();
  }
  
  // 绘制15个随机位置的六边形
  for (let i = 0; i < 15; i++) {
    // 生成随机位置，确保六边形完全在画布内
    const x = hexRadius + Math.random() * (800 - hexRadius * 2);
    const y = hexRadius + Math.random() * (600 - hexRadius * 2);
    
    drawHexagon(graphics, x, y, hexRadius);
  }
}

new Phaser.Game(config);