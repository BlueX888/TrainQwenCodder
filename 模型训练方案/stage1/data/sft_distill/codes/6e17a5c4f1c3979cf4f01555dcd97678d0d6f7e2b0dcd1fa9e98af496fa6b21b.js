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
  // 绘制20个粉色六边形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充
    graphics.fillStyle(0xFFC0CB, 1);
    
    // 六边形半径（大小24像素，半径12像素）
    const radius = 12;
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 计算并绘制六边形的6个顶点
    // 六边形从顶部开始，每个角度间隔60度
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI / 3) * j - Math.PI / 2; // 从顶部开始(-90度)
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (j === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    // 闭合路径
    graphics.closePath();
    
    // 填充路径
    graphics.fillPath();
    
    // 设置随机位置
    // 确保六边形完全在画布内（留出半径的边距）
    const randomX = radius + Math.random() * (800 - 2 * radius);
    const randomY = radius + Math.random() * (600 - 2 * radius);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);