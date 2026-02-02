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
    
    // 六边形半径为12像素（直径24像素）
    const radius = 12;
    
    // 绘制六边形
    graphics.beginPath();
    
    // 计算六边形的6个顶点（从顶部开始，顺时针）
    for (let j = 0; j < 6; j++) {
      // 角度：从-90度开始（顶部），每个顶点间隔60度
      const angle = (Math.PI / 180) * (-90 + j * 60);
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      if (j === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（考虑六边形大小，避免超出边界）
    graphics.setPosition(
      Phaser.Math.Between(radius, 800 - radius),
      Phaser.Math.Between(radius, 600 - radius)
    );
  }
}

new Phaser.Game(config);