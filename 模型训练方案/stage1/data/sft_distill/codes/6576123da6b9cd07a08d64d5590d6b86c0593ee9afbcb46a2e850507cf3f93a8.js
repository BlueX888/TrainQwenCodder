const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建5个橙色三角形
  for (let i = 0; i < 5; i++) {
    const graphics = this.add.graphics();
    
    // 设置橙色填充 (橙色通常是 0xFFA500)
    graphics.fillStyle(0xFFA500, 1);
    
    // 绘制等边三角形，大小为16像素
    // 三角形顶点坐标：顶部居中，底部两侧
    const size = 16;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    graphics.fillTriangle(
      0, -height / 2,           // 顶点（上）
      -size / 2, height / 2,    // 左下顶点
      size / 2, height / 2      // 右下顶点
    );
    
    // 随机设置位置（确保在画布范围内）
    graphics.setRandomPosition(
      size / 2,                    // x 最小值
      height / 2,                  // y 最小值
      config.width - size / 2,     // x 最大值
      config.height - height / 2   // y 最大值
    );
  }
}

new Phaser.Game(config);