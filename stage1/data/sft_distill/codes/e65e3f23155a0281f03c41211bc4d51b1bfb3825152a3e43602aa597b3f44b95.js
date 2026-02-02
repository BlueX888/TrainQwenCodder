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
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 六边形半径（大小为80像素，这里使用半径40）
  const hexRadius = 40;
  
  // 计算六边形顶点的辅助函数
  function getHexagonPoints(centerX, centerY, radius) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  }
  
  // 绘制8个随机位置的六边形
  for (let i = 0; i < 8; i++) {
    // 生成随机位置（考虑边界，留出六边形半径的空间）
    const randomX = Phaser.Math.Between(hexRadius + 10, 800 - hexRadius - 10);
    const randomY = Phaser.Math.Between(hexRadius + 10, 600 - hexRadius - 10);
    
    // 获取六边形顶点
    const hexPoints = getHexagonPoints(randomX, randomY, hexRadius);
    
    // 绘制填充六边形
    graphics.beginPath();
    graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
    for (let j = 1; j < hexPoints.length; j++) {
      graphics.lineTo(hexPoints[j].x, hexPoints[j].y);
    }
    graphics.closePath();
    graphics.fillPath();
    
    // 可选：添加描边使六边形更清晰
    graphics.lineStyle(2, 0xffd700, 1);
    graphics.strokePath();
  }
}

new Phaser.Game(config);