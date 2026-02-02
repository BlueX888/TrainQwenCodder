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
  
  // 绘制星形的函数
  function drawStar(graphics, x, y, size, color) {
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4; // 内半径为外半径的40%
    const points = 5; // 五角星
    
    graphics.fillStyle(color, 1);
    graphics.beginPath();
    
    // 计算星形的顶点
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2; // 从顶部开始
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        graphics.moveTo(px, py);
      } else {
        graphics.lineTo(px, py);
      }
    }
    
    graphics.closePath();
    graphics.fillPath();
  }
  
  // 绘制3个随机位置的灰色星形
  const starSize = 64;
  const grayColor = 0x808080; // 灰色
  
  for (let i = 0; i < 3; i++) {
    // 生成随机位置，确保星形完全在画布内
    const randomX = starSize / 2 + Math.random() * (config.width - starSize);
    const randomY = starSize / 2 + Math.random() * (config.height - starSize);
    
    drawStar(graphics, randomX, randomY, starSize, grayColor);
  }
}

new Phaser.Game(config);