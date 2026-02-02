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
  // 创建 12 个绿色三角形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为绿色
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制三角形（等边三角形，大小为 16 像素）
    // 三角形顶点坐标（中心在原点）
    const size = 16;
    const height = size * Math.sqrt(3) / 2;
    graphics.fillTriangle(
      0, -height / 2,           // 顶点
      -size / 2, height / 2,    // 左下顶点
      size / 2, height / 2      // 右下顶点
    );
    
    // 设置随机位置（确保三角形在画布内）
    graphics.setRandomPosition(
      size,                    // x 最小值
      size,                    // y 最小值
      config.width - size,     // x 最大值
      config.height - size     // y 最大值
    );
  }
}

new Phaser.Game(config);