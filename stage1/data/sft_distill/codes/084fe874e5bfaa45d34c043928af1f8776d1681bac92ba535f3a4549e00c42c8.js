const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 8 个随机位置的绿色三角形
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置绿色填充
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制等边三角形（大小为 16 像素）
    // 三角形顶点坐标：顶部中心点、左下角、右下角
    const size = 16;
    const height = (Math.sqrt(3) / 2) * size; // 等边三角形高度
    
    graphics.fillTriangle(
      0, -height / 2,           // 顶点（顶部中心）
      -size / 2, height / 2,    // 左下角
      size / 2, height / 2      // 右下角
    );
    
    // 设置随机位置（确保三角形完全在画布内）
    const margin = size;
    graphics.setPosition(
      Phaser.Math.Between(margin, config.width - margin),
      Phaser.Math.Between(margin, config.height - margin)
    );
  }
}

new Phaser.Game(config);