const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#282c34'
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
  
  // 设置紫色填充
  graphics.fillStyle(0x9932cc, 1);
  
  // 三角形尺寸约24像素，计算三个顶点坐标
  // 等边三角形，顶点朝上
  const size = 24;
  const height = size * Math.sqrt(3) / 2; // 等边三角形高度
  
  // 三个顶点坐标（相对于中心点）
  const x1 = centerX;                    // 顶部顶点
  const y1 = centerY - height * 2 / 3;
  
  const x2 = centerX - size / 2;         // 左下顶点
  const y2 = centerY + height / 3;
  
  const x3 = centerX + size / 2;         // 右下顶点
  const y3 = centerY + height / 3;
  
  // 绘制填充的三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 可选：添加描边使三角形更清晰
  graphics.lineStyle(2, 0x9932cc, 1);
  graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
}

new Phaser.Game(config);