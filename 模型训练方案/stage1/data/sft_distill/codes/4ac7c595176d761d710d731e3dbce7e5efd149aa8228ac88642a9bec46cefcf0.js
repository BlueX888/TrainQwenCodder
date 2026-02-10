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
  // 菱形大小为 80 像素
  const size = 80;
  const halfSize = size / 2;
  
  // 绘制 20 个随机位置的灰色菱形
  for (let i = 0; i < 20; i++) {
    // 生成随机位置（确保菱形完全在画布内）
    const x = Phaser.Math.Between(halfSize, 800 - halfSize);
    const y = Phaser.Math.Between(halfSize, 600 - halfSize);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置灰色填充 (0x808080)
    graphics.fillStyle(0x808080, 1);
    
    // 绘制菱形路径
    graphics.beginPath();
    
    // 菱形的四个顶点（上、右、下、左）
    graphics.moveTo(x, y - halfSize);           // 上顶点
    graphics.lineTo(x + halfSize, y);           // 右顶点
    graphics.lineTo(x, y + halfSize);           // 下顶点
    graphics.lineTo(x - halfSize, y);           // 左顶点
    
    // 闭合路径
    graphics.closePath();
    
    // 填充路径
    graphics.fillPath();
  }
}

new Phaser.Game(config);