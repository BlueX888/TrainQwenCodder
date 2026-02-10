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
  // 循环创建20个蓝色三角形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置蓝色填充
    graphics.fillStyle(0x0000ff, 1);
    
    // 绘制等边三角形（中心在原点，大小16像素）
    // 等边三角形的顶点计算：
    // 顶点1: (0, -16/2 * 1.155) 上方顶点
    // 顶点2: (-16/2, 16/2 * 0.577) 左下顶点
    // 顶点3: (16/2, 16/2 * 0.577) 右下顶点
    const size = 16;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    graphics.fillTriangle(
      0, -height * 2/3,           // 上顶点
      -size/2, height * 1/3,      // 左下顶点
      size/2, height * 1/3        // 右下顶点
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