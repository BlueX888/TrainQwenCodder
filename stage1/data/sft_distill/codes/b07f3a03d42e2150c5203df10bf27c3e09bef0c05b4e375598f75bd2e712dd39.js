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
  
  // 橙色填充
  graphics.fillStyle(0xFF8C00, 1);
  
  // 六边形大小（从中心到顶点的距离）
  const size = 16; // 32像素直径，半径16
  
  // 绘制六边形的函数
  function drawHexagon(g, x, y, radius) {
    g.beginPath();
    
    // 计算六边形的6个顶点（从顶部开始，顺时针）
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度起始，使顶点朝上
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      
      if (i === 0) {
        g.moveTo(px, py);
      } else {
        g.lineTo(px, py);
      }
    }
    
    g.closePath();
    g.fillPath();
  }
  
  // 绘制12个随机位置的六边形
  for (let i = 0; i < 12; i++) {
    // 生成随机位置，留出边距避免六边形被裁切
    const x = size + Math.random() * (800 - size * 2);
    const y = size + Math.random() * (600 - size * 2);
    
    drawHexagon(graphics, x, y, size);
  }
}

new Phaser.Game(config);