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
  const diamondSize = 48; // 菱形大小
  const halfSize = diamondSize / 2; // 菱形半径
  const diamondCount = 12; // 菱形数量
  
  // 绘制12个随机位置的黄色菱形
  for (let i = 0; i < diamondCount; i++) {
    // 生成随机位置，确保菱形完全在画布内
    const x = halfSize + Math.random() * (config.width - diamondSize);
    const y = halfSize + Math.random() * (config.height - diamondSize);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充
    graphics.fillStyle(0xFFFF00, 1);
    
    // 绘制菱形路径
    graphics.beginPath();
    graphics.moveTo(x, y - halfSize); // 上顶点
    graphics.lineTo(x + halfSize, y); // 右顶点
    graphics.lineTo(x, y + halfSize); // 下顶点
    graphics.lineTo(x - halfSize, y); // 左顶点
    graphics.closePath();
    
    // 填充路径
    graphics.fillPath();
  }
}

new Phaser.Game(config);