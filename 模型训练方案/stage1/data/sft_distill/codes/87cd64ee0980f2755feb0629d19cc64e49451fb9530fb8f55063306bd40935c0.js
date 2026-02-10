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
  // 六边形参数
  const hexagonSize = 24; // 半径（中心到顶点的距离）
  const hexagonCount = 15;
  const cyan = 0x00ffff;
  
  // 绘制15个六边形
  for (let i = 0; i < hexagonCount; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为青色
    graphics.fillStyle(cyan, 1);
    
    // 计算六边形的6个顶点（正六边形，顶点在圆周上，间隔60度）
    graphics.beginPath();
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI / 3) * j - Math.PI / 2; // 从顶部开始，每个顶点间隔60度
      const x = Math.cos(angle) * hexagonSize;
      const y = Math.sin(angle) * hexagonSize;
      
      if (j === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（确保六边形完全在画布内）
    // 六边形的边界框大小约为 48x48（直径）
    const padding = hexagonSize + 4; // 留一些边距
    const randomX = padding + Math.random() * (800 - padding * 2);
    const randomY = padding + Math.random() * (600 - padding * 2);
    
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);