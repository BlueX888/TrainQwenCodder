const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 设置黄色填充样式
  graphics.fillStyle(0xffff00, 1);
  
  // 六边形半径（大小为80像素，半径为40）
  const hexRadius = 40;
  
  /**
   * 计算六边形的6个顶点坐标
   * @param {number} centerX - 中心点X坐标
   * @param {number} centerY - 中心点Y坐标
   * @param {number} radius - 六边形半径
   * @returns {Array} 包含6个顶点的数组，每个顶点是 {x, y} 对象
   */
  function getHexagonPoints(centerX, centerY, radius) {
    const points = [];
    // 六边形有6个顶点，每个顶点之间夹角为60度（π/3弧度）
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i; // 每个顶点的角度
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  }
  
  // 绘制8个随机位置的六边形
  for (let i = 0; i < 8; i++) {
    // 生成随机位置（留出边界空间，避免六边形超出画布）
    const randomX = Phaser.Math.Between(hexRadius + 10, 800 - hexRadius - 10);
    const randomY = Phaser.Math.Between(hexRadius + 10, 600 - hexRadius - 10);
    
    // 获取六边形顶点
    const hexPoints = getHexagonPoints(randomX, randomY, hexRadius);
    
    // 绘制填充的六边形
    graphics.beginPath();
    graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
    
    for (let j = 1; j < hexPoints.length; j++) {
      graphics.lineTo(hexPoints[j].x, hexPoints[j].y);
    }
    
    graphics.closePath();
    graphics.fillPath();
  }
  
  // 添加文本提示
  this.add.text(10, 10, '8 Random Yellow Hexagons (Size: 80px)', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);