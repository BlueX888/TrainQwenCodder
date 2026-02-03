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
  // 无需预加载外部资源
}

function create() {
  // 三角形尺寸
  const size = 64;
  
  // 创建5个紫色三角形
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为紫色
    graphics.fillStyle(0x800080, 1);
    
    // 绘制等边三角形（顶点朝上）
    // 中心点在 (0, 0)，计算三个顶点坐标
    const height = (Math.sqrt(3) / 2) * size; // 等边三角形高度
    const halfSize = size / 2;
    
    graphics.fillTriangle(
      0, -height / 2,           // 顶点（上）
      -halfSize, height / 2,    // 左下顶点
      halfSize, height / 2      // 右下顶点
    );
    
    // 设置随机位置（考虑边界，避免三角形超出画布）
    const margin = size;
    graphics.setPosition(
      Phaser.Math.Between(margin, config.width - margin),
      Phaser.Math.Between(margin, config.height - margin)
    );
  }
}

new Phaser.Game(config);