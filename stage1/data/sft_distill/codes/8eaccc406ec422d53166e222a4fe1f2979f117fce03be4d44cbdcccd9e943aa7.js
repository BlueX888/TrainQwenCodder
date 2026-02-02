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
  // 绘制20个随机位置的红色六边形
  for (let i = 0; i < 20; i++) {
    const graphics = this.add.graphics();
    
    // 设置红色填充
    graphics.fillStyle(0xff0000, 1);
    
    // 六边形参数：半径为12像素（大小24像素）
    const radius = 12;
    const sides = 6;
    
    // 绘制六边形
    graphics.beginPath();
    
    for (let j = 0; j < sides; j++) {
      // 计算每个顶点的角度（从顶部开始，所以减去90度）
      const angle = (Math.PI * 2 / sides) * j - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (j === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（确保六边形完全在画布内）
    const randomX = Phaser.Math.Between(radius, 800 - radius);
    const randomY = Phaser.Math.Between(radius, 600 - radius);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);