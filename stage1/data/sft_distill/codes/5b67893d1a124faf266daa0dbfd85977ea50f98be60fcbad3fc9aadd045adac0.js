const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 椭圆的半径（大小为80像素，半径为40像素）
  const radius = 40;
  
  // 绘制10个随机位置的绿色椭圆
  for (let i = 0; i < 10; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置绿色填充样式
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制椭圆（中心点在 0,0，半径为40）
    graphics.fillEllipse(0, 0, radius, radius);
    
    // 设置随机位置（确保椭圆完全在画布内）
    const randomX = Phaser.Math.Between(radius, config.width - radius);
    const randomY = Phaser.Math.Between(radius, config.height - radius);
    graphics.setPosition(randomX, randomY);
  }
}

// 启动游戏
new Phaser.Game(config);