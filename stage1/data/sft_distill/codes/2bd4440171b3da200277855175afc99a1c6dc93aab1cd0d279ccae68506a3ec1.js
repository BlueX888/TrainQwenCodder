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
  
  // 设置填充颜色为灰色
  graphics.fillStyle(0x808080, 1);
  
  // 计算画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 菱形大小（对角线长度的一半）
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