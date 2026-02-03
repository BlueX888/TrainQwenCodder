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
  // 青色颜色值
  const cyanColor = 0x00ffff;
  
  // 三角形大小
  const size = 16;
  
  // 创建12个随机位置的青色三角形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置青色填充样式
    graphics.fillStyle(cyanColor, 1);
    
    // 绘制等边三角形（指向上）
    // 三个顶点坐标：顶部中心点、左下角、右下角
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    graphics.fillTriangle(
      0, -height * 2/3,           // 顶点（居中）
      -size / 2, height * 1/3,    // 左下角
      size / 2, height * 1/3      // 右下角
    );
    
    // 设置随机位置（确保三角形完全在画布内）
    graphics.setRandomPosition(
      size / 2,                    // x 最小值
      size,                        // y 最小值
      config.width - size / 2,     // x 最大值
      config.height - size         // y 最大值
    );
  }
}

new Phaser.Game(config);