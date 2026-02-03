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
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 设置红色填充
    graphics.fillStyle(0xff0000, 1);
    
    // 绘制六边形
    // 六边形半径为 12 像素（大小24像素）
    const radius = 12;
    const sides = 6;
    
    graphics.beginPath();
    
    // 计算六边形的每个顶点
    for (let j = 0; j < sides; j++) {
      // 从顶部开始绘制，所以初始角度为 -90 度（-Math.PI/2）
      const angle = (Math.PI * 2 / sides) * j - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      if (j === 0) {
        graphics.moveTo(px, py);
      } else {
        graphics.lineTo(px, py);
      }
    }
    
    // 闭合路径并填充
    graphics.closePath();
    graphics.fillPath();
  }
}

new Phaser.Game(config);