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
  
  // 设置紫色填充样式
  graphics.fillStyle(0x9932cc, 1); // 紫色 RGB(153, 50, 204)
  
  // 计算画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 菱形大小（对角线长度）
  const size = 48;
  const halfSize = size / 2;
  
  // 绘制菱形路径
  // 菱形的四个顶点：上、右、下、左
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - halfSize);        // 上顶点
  graphics.lineTo(centerX + halfSize, centerY);        // 右顶点
  graphics.lineTo(centerX, centerY + halfSize);        // 下顶点
  graphics.lineTo(centerX - halfSize, centerY);        // 左顶点
  graphics.closePath();
  
  // 填充菱形
  graphics.fillPath();
}

new Phaser.Game(config);