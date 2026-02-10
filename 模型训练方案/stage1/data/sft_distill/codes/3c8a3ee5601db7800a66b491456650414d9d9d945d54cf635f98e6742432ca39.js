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
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置紫色填充样式
  graphics.fillStyle(0x800080, 1);
  
  // 计算画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 三角形大小约为 24 像素，计算等边三角形的三个顶点
  // 顶点1：顶部中心
  const x1 = centerX;
  const y1 = centerY - 12;
  
  // 顶点2：左下角
  const x2 = centerX - 12;
  const y2 = centerY + 12;
  
  // 顶点3：右下角
  const x3 = centerX + 12;
  const y3 = centerY + 12;
  
  // 绘制填充三角形
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
}

new Phaser.Game(config);