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
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x0000ff, 1);
  
  // 计算画布中心点
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 菱形大小（从中心到顶点的距离）
  const size = 48;
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 菱形的四个顶点（上、右、下、左）
  graphics.moveTo(centerX, centerY - size / 2);  // 上顶点
  graphics.lineTo(centerX + size / 2, centerY);  // 右顶点
  graphics.lineTo(centerX, centerY + size / 2);  // 下顶点
  graphics.lineTo(centerX - size / 2, centerY);  // 左顶点
  
  // 闭合路径
  graphics.closePath();
  
  // 填充菱形
  graphics.fillPath();
}

new Phaser.Game(config);