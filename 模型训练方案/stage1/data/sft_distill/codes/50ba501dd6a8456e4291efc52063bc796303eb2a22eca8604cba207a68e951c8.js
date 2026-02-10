const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#ffffff'
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
  
  // 设置灰色填充样式
  graphics.fillStyle(0x808080, 1);
  
  // 定义三角形的三个顶点（等边三角形，大小约 16 像素）
  // 顶点1：上方中心
  const x1 = centerX;
  const y1 = centerY - 8;
  
  // 顶点2：左下
  const x2 = centerX - 8;
  const y2 = centerY + 8;
  
  // 顶点3：右下
  const x3 = centerX + 8;
  const y3 = centerY + 8;
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 可选：添加描边使三角形更清晰
  graphics.lineStyle(1, 0x606060, 1);
  graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
}

new Phaser.Game(config);