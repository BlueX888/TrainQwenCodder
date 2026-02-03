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
  
  // 设置蓝色填充样式
  graphics.fillStyle(0x0000ff, 1);
  
  // 计算画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 定义三角形的三个顶点（等边三角形）
  // 顶点1: 顶部中心
  const x1 = centerX;
  const y1 = centerY - 18;
  
  // 顶点2: 左下角
  const x2 = centerX - 16;
  const y2 = centerY + 14;
  
  // 顶点3: 右下角
  const x3 = centerX + 16;
  const y3 = centerY + 14;
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 可选：添加描边使三角形更明显
  graphics.lineStyle(2, 0x00ffff, 1);
  graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
}

new Phaser.Game(config);