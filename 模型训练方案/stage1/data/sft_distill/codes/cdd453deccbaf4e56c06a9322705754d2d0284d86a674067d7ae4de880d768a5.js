const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 绘制星形的函数
  function drawStar(graphics, x, y, points, outerRadius, innerRadius) {
    graphics.beginPath();
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2;
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
  
  // 设置白色填充
  graphics.fillStyle(0xffffff, 1);
  
  // 星形参数
  const starSize = 80; // 星形大小
  const outerRadius = starSize / 2;
  const innerRadius = outerRadius * 0.4; // 内半径约为外半径的40%
  const points = 5; // 五角星
  
  // 绘制20个随机位置的星形
  for (let i = 0; i < 20; i++) {
    // 生成随机位置，确保星形完全在画布内
    const x = outerRadius + Math.random() * (config.width - outerRadius * 2);
    const y = outerRadius + Math.random() * (config.height - outerRadius * 2);
    
    drawStar(graphics, x, y, points, outerRadius, innerRadius);
  }
}

new Phaser.Game(config);