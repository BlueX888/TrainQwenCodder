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
  // 菱形大小为80像素，定义菱形的四个顶点（以中心为原点）
  // 菱形是正方形旋转45度，对角线长度为80像素
  const size = 80;
  const halfSize = size / 2;
  
  // 菱形顶点坐标（上、右、下、左）
  const diamondPoints = [
    { x: 0, y: -halfSize },      // 上顶点
    { x: halfSize, y: 0 },       // 右顶点
    { x: 0, y: halfSize },       // 下顶点
    { x: -halfSize, y: 0 }       // 左顶点
  ];
  
  // 创建12个随机位置的绿色菱形
  for (let i = 0; i < 12; i++) {
    const graphics = this.add.graphics();
    
    // 设置绿色填充
    graphics.fillStyle(0x00ff00, 1);
    
    // 开始路径并绘制菱形
    graphics.beginPath();
    graphics.moveTo(diamondPoints[0].x, diamondPoints[0].y);
    for (let j = 1; j < diamondPoints.length; j++) {
      graphics.lineTo(diamondPoints[j].x, diamondPoints[j].y);
    }
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（确保菱形完全在画布内）
    // 留出halfSize的边距，避免菱形超出边界
    const randomX = Phaser.Math.Between(halfSize, config.width - halfSize);
    const randomY = Phaser.Math.Between(halfSize, config.height - halfSize);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);