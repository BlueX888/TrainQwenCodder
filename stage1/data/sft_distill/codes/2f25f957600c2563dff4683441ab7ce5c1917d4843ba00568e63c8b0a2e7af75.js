const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 计算画布中心点
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 三角形的大小（从中心到顶点的距离）
  const size = 32;
  
  // 计算等边三角形的三个顶点坐标
  // 顶点1：顶部中心
  const x1 = centerX;
  const y1 = centerY - size * 0.67; // 向上偏移
  
  // 顶点2：左下
  const x2 = centerX - size * 0.87; // sin(60°) ≈ 0.87
  const y2 = centerY + size * 0.33;
  
  // 顶点3：右下
  const x3 = centerX + size * 0.87;
  const y3 = centerY + size * 0.33;
  
  // 设置填充颜色为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 可选：添加描边使三角形更清晰
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
}

// 启动游戏
new Phaser.Game(config);