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
  // 六边形半径（外接圆半径）
  const radius = 32;
  
  // 计算正六边形的6个顶点坐标
  function getHexagonPoints(radius) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  }
  
  const hexPoints = getHexagonPoints(radius);
  
  // 绘制12个随机位置的灰色六边形
  for (let i = 0; i < 12; i++) {
    const graphics = this.add.graphics();
    
    // 设置灰色填充
    graphics.fillStyle(0x808080, 1);
    
    // 绘制六边形
    graphics.beginPath();
    graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
    for (let j = 1; j < hexPoints.length; j++) {
      graphics.lineTo(hexPoints[j].x, hexPoints[j].y);
    }
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（考虑边界，避免六边形超出画布）
    const x = Phaser.Math.Between(radius, 800 - radius);
    const y = Phaser.Math.Between(radius, 600 - radius);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);