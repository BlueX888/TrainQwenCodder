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
  // 获取画布中心坐标
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置绿色填充样式
  graphics.fillStyle(0x00ff00, 1);
  
  // 菱形大小（从中心到顶点的距离）
  const size = 12; // 总大小约为 24 像素
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 绘制菱形的四个顶点（上、右、下、左）
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