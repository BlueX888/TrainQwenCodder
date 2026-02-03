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
  // 绘制20个随机位置的粉色六边形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置随机位置（留出边距，避免六边形被裁剪）
    const x = Phaser.Math.Between(30, 770);
    const y = Phaser.Math.Between(30, 570);
    graphics.setPosition(x, y);
    
    // 设置粉色填充
    graphics.fillStyle(0xff69b4, 1); // 粉色 (HotPink)
    
    // 绘制正六边形
    // 半径为 12 像素（直径 24 像素）
    const radius = 12;
    const sides = 6;
    
    graphics.beginPath();
    
    // 计算六边形的6个顶点
    for (let j = 0; j < sides; j++) {
      // 从顶部开始绘制（-90度偏移）
      const angle = (Math.PI * 2 / sides) * j - Math.PI / 2;
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