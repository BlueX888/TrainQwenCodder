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
  // 定义菱形的顶点坐标（大小为80像素，即从中心到顶点距离为40）
  const diamondPoints = [
    { x: 0, y: -40 },    // 上顶点
    { x: 40, y: 0 },     // 右顶点
    { x: 0, y: 40 },     // 下顶点
    { x: -40, y: 0 }     // 左顶点
  ];

  // 创建12个随机位置的绿色菱形
  for (let i = 0; i < 12; i++) {
    const graphics = this.add.graphics();
    
    // 设置绿色填充
    graphics.fillStyle(0x00ff00, 1);
    
    // 开始绘制路径
    graphics.beginPath();
    graphics.moveTo(diamondPoints[0].x, diamondPoints[0].y);
    
    // 依次连接各个顶点
    for (let j = 1; j < diamondPoints.length; j++) {
      graphics.lineTo(diamondPoints[j].x, diamondPoints[j].y);
    }
    
    // 闭合路径并填充
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（确保菱形完全在画布内，留出40像素边距）
    const randomX = Phaser.Math.Between(40, 760);
    const randomY = Phaser.Math.Between(40, 560);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);