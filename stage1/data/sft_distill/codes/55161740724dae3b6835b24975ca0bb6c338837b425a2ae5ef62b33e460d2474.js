const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  }
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
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 定义菱形的四个顶点（菱形大小约为 24 像素）
  // 菱形是一个正方形旋转 45 度，所以对角线长度为 24 像素
  // 从中心到顶点的距离为 12 像素
  const size = 12;
  const points = [
    centerX, centerY - size,  // 上顶点
    centerX + size, centerY,  // 右顶点
    centerX, centerY + size,  // 下顶点
    centerX - size, centerY   // 左顶点
  ];
  
  // 绘制菱形
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  graphics.lineTo(points[2], points[3]);
  graphics.lineTo(points[4], points[5]);
  graphics.lineTo(points[6], points[7]);
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);