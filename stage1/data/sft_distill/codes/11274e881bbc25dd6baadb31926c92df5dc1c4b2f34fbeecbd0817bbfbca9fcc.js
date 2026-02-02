const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建12个随机位置的绿色三角形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const triangle = this.add.graphics();
    
    // 设置绿色填充
    triangle.fillStyle(0x00ff00, 1);
    
    // 绘制等边三角形（大小16像素）
    // 三角形顶点坐标（以中心为原点）
    const size = 16;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    triangle.fillTriangle(
      0, -height / 2,           // 顶点（上）
      -size / 2, height / 2,    // 左下顶点
      size / 2, height / 2      // 右下顶点
    );
    
    // 设置随机位置（确保三角形完全在画布内）
    const margin = size;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    
    triangle.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);