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
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 菱形大小（从中心到顶点的距离）
  const size = 24; // 总大小约 48 像素
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x0000ff, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 绘制菱形的四个顶点
  graphics.moveTo(centerX, centerY - size);        // 上顶点
  graphics.lineTo(centerX + size, centerY);        // 右顶点
  graphics.lineTo(centerX, centerY + size);        // 下顶点
  graphics.lineTo(centerX - size, centerY);        // 左顶点
  
  // 闭合路径
  graphics.closePath();
  
  // 填充菱形
  graphics.fillPath();
}

new Phaser.Game(config);