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
  // 绘制星形的函数
  const drawStar = (graphics, size) => {
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;
    const points = 5;
    
    graphics.beginPath();
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    graphics.closePath();
    graphics.fillPath();
  };
  
  // 创建5个随机位置的粉色星形
  for (let i = 0; i < 5; i++) {
    const graphics = this.add.graphics();
    
    // 设置粉色填充 (0xFFC0CB 是粉色的十六进制值)
    graphics.fillStyle(0xFFC0CB, 1);
    
    // 绘制星形
    drawStar(graphics, 64);
    
    // 设置随机位置（考虑星形大小，避免超出边界）
    const randomX = Phaser.Math.Between(32, 768);
    const randomY = Phaser.Math.Between(32, 568);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);