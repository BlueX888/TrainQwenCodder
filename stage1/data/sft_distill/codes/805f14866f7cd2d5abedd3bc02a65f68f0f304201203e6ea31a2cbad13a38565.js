const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 星形参数
  const starSize = 64;
  const outerRadius = starSize / 2;
  const innerRadius = outerRadius * 0.4;
  const numStars = 20;
  
  // 计算星形的顶点坐标（5个尖角）
  function createStarPoints(centerX, centerY, outerR, innerR) {
    const points = [];
    const numPoints = 5;
    
    for (let i = 0; i < numPoints * 2; i++) {
      const angle = (i * Math.PI) / numPoints - Math.PI / 2;
      const radius = i % 2 === 0 ? outerR : innerR;
      
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
    
    return points;
  }
  
  // 创建20个随机位置的蓝色星形
  for (let i = 0; i < numStars; i++) {
    const graphics = this.add.graphics();
    
    // 设置蓝色填充
    graphics.fillStyle(0x0066ff, 1);
    
    // 生成星形顶点（以原点为中心）
    const starPoints = createStarPoints(0, 0, outerRadius, innerRadius);
    
    // 绘制星形路径
    graphics.beginPath();
    graphics.moveTo(starPoints[0].x, starPoints[0].y);
    
    for (let j = 1; j < starPoints.length; j++) {
      graphics.lineTo(starPoints[j].x, starPoints[j].y);
    }
    
    graphics.closePath();
    graphics.fillPath();
    
    // 随机位置放置星形（考虑边界，避免星形超出屏幕）
    const randomX = Phaser.Math.Between(outerRadius, config.width - outerRadius);
    const randomY = Phaser.Math.Between(outerRadius, config.height - outerRadius);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);