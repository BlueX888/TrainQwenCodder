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
  // 循环创建12个绿色三角形
  for (let i = 0; i < 12; i++) {
    const graphics = this.add.graphics();
    
    // 设置绿色填充
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制等边三角形，大小为16像素
    // 计算三角形顶点坐标（中心对齐）
    const height = 16;
    const halfBase = height * Math.tan(Math.PI / 6); // 等边三角形底边的一半
    
    graphics.fillTriangle(
      0, -height / 2,           // 顶点（上）
      -halfBase, height / 2,    // 左下顶点
      halfBase, height / 2      // 右下顶点
    );
    
    // 随机设置位置
    graphics.setRandomPosition(
      0, 
      0, 
      config.width, 
      config.height
    );
  }
}

new Phaser.Game(config);