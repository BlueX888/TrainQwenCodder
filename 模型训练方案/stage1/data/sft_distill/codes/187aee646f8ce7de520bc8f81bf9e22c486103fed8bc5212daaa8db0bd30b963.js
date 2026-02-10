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
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置灰色填充样式 (0x808080 为灰色)
  graphics.fillStyle(0x808080, 1);
  
  // 计算画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 菱形的半宽和半高（约 48 像素的菱形，使用 24 像素作为半径）
  const size = 24;
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 绘制菱形的四个顶点
  // 上顶点
  graphics.moveTo(centerX, centerY - size);
  // 右顶点
  graphics.lineTo(centerX + size, centerY);
  // 下顶点
  graphics.lineTo(centerX, centerY + size);
  // 左顶点
  graphics.lineTo(centerX - size, centerY);
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);