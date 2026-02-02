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
  
  // 菱形的半宽和半高（约 24 像素的菱形，每边约 17 像素）
  const halfSize = 12;
  
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色为绿色
  graphics.fillStyle(0x00ff00, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 菱形的四个顶点（上、右、下、左）
  graphics.moveTo(centerX, centerY - halfSize);        // 顶部顶点
  graphics.lineTo(centerX + halfSize, centerY);        // 右侧顶点
  graphics.lineTo(centerX, centerY + halfSize);        // 底部顶点
  graphics.lineTo(centerX - halfSize, centerY);        // 左侧顶点
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);