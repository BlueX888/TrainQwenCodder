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
  function drawStar(graphics, x, y, points, outerRadius, innerRadius, color) {
    graphics.fillStyle(color, 1);
    graphics.beginPath();
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
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
  const starSize = 64; // 星形外径
  const outerRadius = starSize / 2;
  const innerRadius = outerRadius * 0.4; // 内径约为外径的40%
  const grayColor = 0x808080; // 灰色
  const points = 5; // 五角星
  
  for (let i = 0; i < 3; i++) {
    // 生成随机位置，确保星形完全在画布内
    const randomX = outerRadius + Math.random() * (config.width - starSize);
    const randomY = outerRadius + Math.random() * (config.height - starSize);
    
    drawStar(graphics, randomX, randomY, points, outerRadius, innerRadius, grayColor);
  }
}

new Phaser.Game(config);