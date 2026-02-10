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
  
  // 设置绿色填充样式
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算画布中心点
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 三角形大小参数（边长约 48 像素）
  const size = 48;
  
  // 计算等边三角形的三个顶点坐标
  // 顶点1：顶部中心
  const x1 = centerX;
  const y1 = centerY - size / Math.sqrt(3);
  
  // 顶点2：左下
  const x2 = centerX - size / 2;
  const y2 = centerY + size / (2 * Math.sqrt(3));
  
  // 顶点3：右下
  const x3 = centerX + size / 2;
  const y3 = centerY + size / (2 * Math.sqrt(3));
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 可选：添加描边使三角形更清晰
  graphics.lineStyle(2, 0x00aa00, 1);
  graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
}

// 启动游戏
new Phaser.Game(config);