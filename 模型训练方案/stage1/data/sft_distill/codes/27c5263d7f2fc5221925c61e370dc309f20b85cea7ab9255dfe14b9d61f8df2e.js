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
  // 粉色颜色值
  const pinkColor = 0xFF69B4;
  
  // 菱形大小（从中心到顶点的距离）
  const size = 12; // 24像素菱形，半径为12
  
  // 创建10个随机位置的粉色菱形
  for (let i = 0; i < 10; i++) {
    const graphics = this.add.graphics();
    
    // 设置填充颜色为粉色
    graphics.fillStyle(pinkColor, 1);
    
    // 绘制菱形路径
    // 菱形是一个旋转45度的正方形，由4个顶点组成
    graphics.beginPath();
    graphics.moveTo(0, -size);      // 上顶点
    graphics.lineTo(size, 0);       // 右顶点
    graphics.lineTo(0, size);       // 下顶点
    graphics.lineTo(-size, 0);      // 左顶点
    graphics.closePath();
    
    // 填充路径
    graphics.fillPath();
    
    // 设置随机位置（确保菱形完全在画布内）
    graphics.setRandomPosition(
      size,                    // x 最小值
      size,                    // y 最小值
      config.width - size * 2, // x 范围
      config.height - size * 2 // y 范围
    );
  }
}

new Phaser.Game(config);