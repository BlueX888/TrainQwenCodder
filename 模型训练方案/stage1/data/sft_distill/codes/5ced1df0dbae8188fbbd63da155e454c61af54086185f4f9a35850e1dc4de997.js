const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 获取画布中心点
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 三角形大小（从中心到顶点的距离）
  const size = 48;
  
  // 计算等边三角形的三个顶点坐标
  // 顶点朝上的等边三角形
  const height = size * Math.sqrt(3) / 2; // 等边三角形高度
  
  const x1 = centerX;                    // 顶部顶点
  const y1 = centerY - height * 2 / 3;
  
  const x2 = centerX - size / 2;         // 左下顶点
  const y2 = centerY + height / 3;
  
  const x3 = centerX + size / 2;         // 右下顶点
  const y3 = centerY + height / 3;
  
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置绿色填充
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 添加深绿色描边使三角形轮廓更清晰
  graphics.lineStyle(2, 0x008800, 1);
  graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
}

new Phaser.Game(config);