const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 计算六边形顶点的辅助函数
  // centerX, centerY: 六边形中心坐标
  // size: 六边形外接圆半径（从中心到顶点的距离）
  function getHexagonPoints(centerX, centerY, size) {
    const points = [];
    // 六边形有6个顶点，每个顶点间隔60度
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始，逆时针
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  }
  
  // 绘制8个随机位置的黄色六边形
  const hexagonSize = 40; // 半径40像素，直径约80像素
  const margin = 60; // 边距，避免六边形超出画布
  
  for (let i = 0; i < 8; i++) {
    // 生成随机位置
    const randomX = margin + Math.random() * (config.width - 2 * margin);
    const randomY = margin + Math.random() * (config.height - 2 * margin);
    
    // 获取六边形顶点
    const points = getHexagonPoints(randomX, randomY, hexagonSize);
    
    // 设置填充颜色为黄色
    graphics.fillStyle(0xffff00, 1);
    
    // 填充六边形
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let j = 1; j < points.length; j++) {
      graphics.lineTo(points[j].x, points[j].y);
    }
    graphics.closePath();
    graphics.fillPath();
    
    // 添加黑色边框使六边形更清晰
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let j = 1; j < points.length; j++) {
      graphics.lineTo(points[j].x, points[j].y);
    }
    graphics.closePath();
    graphics.strokePath();
  }
}

new Phaser.Game(config);