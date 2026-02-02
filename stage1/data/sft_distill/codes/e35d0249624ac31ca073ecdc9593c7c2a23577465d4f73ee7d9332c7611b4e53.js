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
  // 六边形参数
  const hexagonSize = 24; // 六边形大小（直径）
  const radius = hexagonSize / 2; // 半径
  const hexagonCount = 20; // 六边形数量
  const pinkColor = 0xffc0cb; // 粉色
  
  // 绘制20个随机位置的六边形
  for (let i = 0; i < hexagonCount; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为粉色
    graphics.fillStyle(pinkColor, 1);
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 计算六边形的6个顶点（正六边形，从顶部开始顺时针）
    for (let j = 0; j < 6; j++) {
      // 角度：从-90度开始（顶部），每次旋转60度
      const angle = (Math.PI / 180) * (j * 60 - 90);
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
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
    const randomX = Math.random() * (config.width - hexagonSize) + radius;
    const randomY = Math.random() * (config.height - hexagonSize) + radius;
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);