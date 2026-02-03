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
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置灰色填充样式
  graphics.fillStyle(0x808080, 1);
  
  // 计算画布中心点
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 三角形大小约为 16 像素
  const size = 16;
  
  // 计算等边三角形的三个顶点坐标
  // 顶点1：顶部中心
  const x1 = centerX;
  const y1 = centerY - size / 2;
  
  // 顶点2：左下角
  const x2 = centerX - size / 2;
  const y2 = centerY + size / 2;
  
  // 顶点3：右下角
  const x3 = centerX + size / 2;
  const y3 = centerY + size / 2;
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 可选：添加描边使三角形更清晰
  graphics.lineStyle(1, 0x606060, 1);
  graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
}

new Phaser.Game(config);