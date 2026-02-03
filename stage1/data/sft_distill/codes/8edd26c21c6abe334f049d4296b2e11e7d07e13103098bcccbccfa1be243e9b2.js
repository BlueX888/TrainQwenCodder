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
  
  // 设置白色填充
  graphics.fillStyle(0xffffff, 1);
  
  // 六边形大小为32像素，半径为16像素
  const hexSize = 16;
  
  // 绘制六边形的函数
  function drawHexagon(graphics, x, y, radius) {
    graphics.beginPath();
    
    // 计算六边形的6个顶点（从顶部开始，顺时针）
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度起始，使顶点朝上
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
  for (let i = 0; i < 12; i++) {
    // 生成随机坐标，确保六边形完全在画布内
    // 留出边距避免六边形被裁切（半径16像素 + 额外边距）
    const margin = hexSize + 10;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    
    drawHexagon(graphics, randomX, randomY, hexSize);
  }
}

new Phaser.Game(config);