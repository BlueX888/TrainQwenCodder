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
  // 创建12个随机位置的青色三角形
  for (let i = 0; i < 12; i++) {
    const graphics = this.add.graphics();
    
    // 设置青色填充
    graphics.fillStyle(0x00ffff, 1);
    
    // 绘制等边三角形（大小16像素）
    // 三角形顶点坐标，以中心为原点
    const height = 16;
    const halfBase = height * Math.sqrt(3) / 2;
    
    graphics.fillTriangle(
      0, -height / 2,           // 顶点
      -halfBase, height / 2,    // 左下角
      halfBase, height / 2      // 右下角
    );
    
    // 随机位置（考虑边界，避免三角形超出屏幕）
    const randomX = Phaser.Math.Between(20, 780);
    const randomY = Phaser.Math.Between(20, 580);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);