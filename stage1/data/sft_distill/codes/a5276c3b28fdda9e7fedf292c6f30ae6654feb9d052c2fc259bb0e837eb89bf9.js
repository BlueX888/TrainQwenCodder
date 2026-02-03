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
  // 创建 3 个红色三角形
  for (let i = 0; i < 3; i++) {
    const graphics = this.add.graphics();
    
    // 设置红色填充
    graphics.fillStyle(0xff0000, 1);
    
    // 绘制等边三角形（大小为 80 像素）
    // 三角形的三个顶点：顶部中心、左下、右下
    const size = 80;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    graphics.fillTriangle(
      0, -height / 2,           // 顶点（顶部中心）
      -size / 2, height / 2,    // 左下顶点
      size / 2, height / 2      // 右下顶点
    );
    
    // 设置随机位置（确保三角形完全在画布内）
    const margin = size;
    graphics.setPosition(
      Phaser.Math.Between(margin, 800 - margin),
      Phaser.Math.Between(margin, 600 - margin)
    );
  }
}

new Phaser.Game(config);