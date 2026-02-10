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
  // 绘制20个随机位置的黄色三角形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制等边三角形（大小24像素）
    // 三角形顶点坐标计算：
    // 顶点在上方中心，底边水平
    const size = 24;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    graphics.fillTriangle(
      0, -height / 2,           // 顶点（上方中心）
      -size / 2, height / 2,    // 左下角
      size / 2, height / 2      // 右下角
    );
    
    // 随机设置位置（确保三角形完全在画布内）
    const margin = size;
    graphics.setRandomPosition(
      margin, 
      margin, 
      config.width - margin * 2, 
      config.height - margin * 2
    );
  }
}

new Phaser.Game(config);