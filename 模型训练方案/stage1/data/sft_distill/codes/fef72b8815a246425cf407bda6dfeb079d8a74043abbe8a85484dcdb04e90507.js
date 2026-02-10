const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制三角形
  const graphics = this.add.graphics();
  
  // 设置粉色填充样式 (0xFFC0CB 是粉色的十六进制值)
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 绘制等边三角形（边长64像素）
  // 计算三角形的三个顶点坐标
  const size = 64;
  const height = (Math.sqrt(3) / 2) * size; // 等边三角形的高
  
  // 以中心为原点绘制三角形
  const x1 = 0;           // 顶点（顶部中心）
  const y1 = -height / 2;
  const x2 = -size / 2;   // 左下角
  const y2 = height / 2;
  const x3 = size / 2;    // 右下角
  const y3 = height / 2;
  
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 将绘制的三角形生成为纹理
  graphics.generateTexture('pinkTriangle', size, size);
  
  // 清除 graphics 对象（已经生成纹理，不再需要显示）
  graphics.destroy();
  
  // 创建12个随机位置的三角形
  for (let i = 0; i < 12; i++) {
    // 生成随机位置（考虑三角形大小，避免超出边界）
    const randomX = Phaser.Math.Between(size / 2, config.width - size / 2);
    const randomY = Phaser.Math.Between(size / 2, config.height - size / 2);
    
    // 在随机位置创建三角形图像
    this.add.image(randomX, randomY, 'pinkTriangle');
  }
}

new Phaser.Game(config);