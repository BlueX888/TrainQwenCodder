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
  const hexagonSize = 48; // 六边形直径
  const radius = hexagonSize / 2; // 半径24像素
  const hexagonCount = 15;
  
  // 绘制15个随机位置的青色六边形
  for (let i = 0; i < hexagonCount; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置青色填充
    graphics.fillStyle(0x00ffff, 1);
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 计算六边形的6个顶点（正六边形，顶点在正上方）
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI / 3) * j - Math.PI / 2; // 从正上方开始，每60度一个顶点
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (j === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    // 闭合路径并填充
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（确保六边形完全在画布内）
    const randomX = radius + Math.random() * (800 - 2 * radius);
    const randomY = radius + Math.random() * (600 - 2 * radius);
    graphics.setPosition(randomX, randomY);
  }
  
  // 添加提示文本
  this.add.text(10, 10, '15 Random Cyan Hexagons (48px each)', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);