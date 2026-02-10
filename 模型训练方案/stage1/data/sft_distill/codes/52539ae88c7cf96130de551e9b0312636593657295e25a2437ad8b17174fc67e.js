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
  
  // 计算菱形的中心点（画布中央）
  const centerX = 400;
  const centerY = 300;
  
  // 菱形的半对角线长度（48 像素菱形，对角线为 48，半对角线为 24）
  const halfSize = 24;
  
  // 绘制菱形路径
  graphics.beginPath();
  
  // 上顶点
  graphics.moveTo(centerX, centerY - halfSize);
  
  // 右顶点
  graphics.lineTo(centerX + halfSize, centerY);
  
  // 下顶点
  graphics.lineTo(centerX, centerY + halfSize);
  
  // 左顶点
  graphics.lineTo(centerX - halfSize, centerY);
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);