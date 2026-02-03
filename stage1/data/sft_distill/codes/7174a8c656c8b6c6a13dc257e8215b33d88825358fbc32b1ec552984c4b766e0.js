const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 绘制20个随机位置的白色六边形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置随机位置（留出边距避免六边形被裁切）
    const x = Phaser.Math.Between(64, 736);
    const y = Phaser.Math.Between(64, 536);
    graphics.setPosition(x, y);
    
    // 设置白色填充
    graphics.fillStyle(0xffffff, 1);
    
    // 绘制六边形（大小64像素，半径32像素）
    const radius = 32;
    const sides = 6;
    
    graphics.beginPath();
    
    // 计算六边形的6个顶点
    for (let j = 0; j < sides; j++) {
      const angle = (Math.PI / 3) * j - Math.PI / 2; // 从顶部开始，每60度一个顶点
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      
      if (j === 0) {
        graphics.moveTo(px, py);
      } else {
        graphics.lineTo(px, py);
      }
    }
    
    graphics.closePath();
    graphics.fillPath();
  }
}

new Phaser.Game(config);