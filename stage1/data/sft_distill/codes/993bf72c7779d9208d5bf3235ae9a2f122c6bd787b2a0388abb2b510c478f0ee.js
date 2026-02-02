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
  // 获取画布中心点
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置紫色填充色 (紫色: 0x800080)
  graphics.fillStyle(0x800080, 1);
  
  // 定义菱形的四个顶点（相对于中心点）
  // 菱形大小约为 48 像素（从中心到边缘 24 像素）
  const size = 24;
  const points = [
    centerX, centerY - size,  // 上顶点
    centerX + size, centerY,  // 右顶点
    centerX, centerY + size,  // 下顶点
    centerX - size, centerY   // 左顶点
  ];
  
  // 开始绘制路径
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  graphics.lineTo(points[2], points[3]);
  graphics.lineTo(points[4], points[5]);
  graphics.lineTo(points[6], points[7]);
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);