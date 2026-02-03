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
  // 无需预加载资源
}

function create() {
  const diamondSize = 80; // 菱形大小
  const halfSize = diamondSize / 2; // 半径
  
  // 绘制12个随机位置的绿色菱形
  for (let i = 0; i < 12; i++) {
    // 生成随机位置，确保菱形完全在画布内
    const x = Phaser.Math.Between(halfSize, 800 - halfSize);
    const y = Phaser.Math.Between(halfSize, 600 - halfSize);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为绿色
    graphics.fillStyle(0x00ff00, 1);
    
    // 开始绘制菱形路径
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