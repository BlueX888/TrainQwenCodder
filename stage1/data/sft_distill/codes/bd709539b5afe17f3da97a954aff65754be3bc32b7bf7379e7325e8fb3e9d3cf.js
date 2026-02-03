const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置蓝色填充样式
  graphics.fillStyle(0x0000ff, 1);
  
  // 计算画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 菱形大小（从中心到顶点的距离）
  const size = 40;
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 菱形的四个顶点坐标
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