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
  
  // 设置紫色填充样式
  graphics.fillStyle(0x9932cc, 1); // 紫色
  
  // 计算画布中心点
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  
  // 菱形大小（从中心到顶点的距离）
  const size = 48;
  
  // 绘制菱形路径
  // 菱形的四个顶点：上、右、下、左
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size / 2);        // 上顶点
  graphics.lineTo(centerX + size / 2, centerY);        // 右顶点
  graphics.lineTo(centerX, centerY + size / 2);        // 下顶点
  graphics.lineTo(centerX - size / 2, centerY);        // 左顶点
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);