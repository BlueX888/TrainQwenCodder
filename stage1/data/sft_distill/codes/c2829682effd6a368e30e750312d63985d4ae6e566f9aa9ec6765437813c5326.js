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
  graphics.fillStyle(0x800080, 1);
  
  // 计算画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 三角形的大小（边长约 24 像素）
  const size = 24;
  
  // 计算等边三角形的三个顶点坐标
  // 顶点1：顶部中心
  const x1 = centerX;
  const y1 = centerY - (size * Math.sqrt(3) / 3);
  
  // 顶点2：左下角
  const x2 = centerX - size / 2;
  const y2 = centerY + (size * Math.sqrt(3) / 6);
  
  // 顶点3：右下角
  const x3 = centerX + size / 2;
  const y3 = centerY + (size * Math.sqrt(3) / 6);
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 可选：添加描边使三角形更清晰
  graphics.lineStyle(2, 0x9932cc, 1);
  graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
}

// 创建游戏实例
new Phaser.Game(config);