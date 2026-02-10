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
  // 三角形大小
  const size = 64;
  
  // 计算等边三角形的顶点坐标（以中心为原点）
  const height = (Math.sqrt(3) / 2) * size; // 等边三角形高度
  const halfSize = size / 2;
  
  // 创建5个紫色三角形
  for (let i = 0; i < 5; i++) {
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x800080, 1);
    
    // 绘制等边三角形（顶点朝上）
    // 顶点1：顶部中心
    // 顶点2：左下角
    // 顶点3：右下角
    graphics.fillTriangle(
      0, -height / 2,           // 顶部顶点
      -halfSize, height / 2,    // 左下顶点
      halfSize, height / 2      // 右下顶点
    );
    
    // 设置随机位置（考虑三角形大小，避免超出边界）
    const margin = size;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);