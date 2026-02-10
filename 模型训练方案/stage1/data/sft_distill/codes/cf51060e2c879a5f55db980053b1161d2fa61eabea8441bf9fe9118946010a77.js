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
  // 创建12个随机位置的绿色三角形
  for (let i = 0; i < 12; i++) {
    const graphics = this.add.graphics();
    
    // 设置绿色填充
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制三角形（等边三角形，大小为16像素）
    // 三角形顶点：顶部中心、左下、右下
    const size = 16;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    graphics.fillTriangle(
      0, -height / 2,           // 顶点（上）
      -size / 2, height / 2,    // 左下顶点
      size / 2, height / 2      // 右下顶点
    );
    
    // 随机设置位置（确保三角形完全在画布内）
    graphics.setRandomPosition(
      size / 2,                 // x 最小值
      height / 2,               // y 最小值
      800 - size / 2,           // x 最大值
      600 - height / 2          // y 最大值
    );
  }
}

new Phaser.Game(config);