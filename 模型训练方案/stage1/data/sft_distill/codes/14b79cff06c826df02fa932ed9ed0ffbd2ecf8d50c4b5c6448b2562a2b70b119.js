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
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置黄色填充样式 (0xFFFF00 是黄色的十六进制值)
  graphics.fillStyle(0xFFFF00, 1);
  
  // 计算画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 菱形大小为 24 像素，即从中心到各顶点的距离为 12 像素
  const size = 12;
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 绘制菱形的四个顶点（上、右、下、左）
  graphics.moveTo(centerX, centerY - size);        // 上顶点
  graphics.lineTo(centerX + size, centerY);        // 右顶点
  graphics.lineTo(centerX, centerY + size);        // 下顶点
  graphics.lineTo(centerX - size, centerY);        // 左顶点
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);