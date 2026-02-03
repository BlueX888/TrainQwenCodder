const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 设置白色填充和描边
  graphics.fillStyle(0xffffff, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 六边形大小
  const hexSize = 64;
  const hexRadius = hexSize / 2;
  
  // 绘制六边形的函数
  function drawHexagon(g, x, y, radius) {
    g.beginPath();
    
    // 计算六边形的6个顶点（从顶部开始，顺时针）
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度起始，使顶点在上方
      const vx = x + radius * Math.cos(angle);
      const vy = y + radius * Math.sin(angle);
      
      if (i === 0) {
        g.moveTo(vx, vy);
      } else {
        g.lineTo(vx, vy);
      }
    }
    
    g.closePath();
    g.fillPath();
    g.strokePath();
  }
  
  // 绘制20个随机位置的六边形
  for (let i = 0; i < 20; i++) {
    // 随机位置，确保六边形完全在画布内
    const x = Phaser.Math.Between(hexRadius, config.width - hexRadius);
    const y = Phaser.Math.Between(hexRadius, config.height - hexRadius);
    
    drawHexagon(graphics, x, y, hexRadius);
  }
}

new Phaser.Game(config);