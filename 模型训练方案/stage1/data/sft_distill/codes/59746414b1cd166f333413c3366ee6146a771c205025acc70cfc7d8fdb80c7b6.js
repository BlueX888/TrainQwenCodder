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
  // 创建3个蓝色方块
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置蓝色填充样式 (RGB: 0x0000ff)
    graphics.fillStyle(0x0000ff, 1);
    
    // 绘制 32x32 的矩形，以左上角为原点
    graphics.fillRect(0, 0, 32, 32);
    
    // 设置随机位置
    // 确保方块完全在画布内（考虑32像素的宽高）
    const randomX = Phaser.Math.Between(0, config.width - 32);
    const randomY = Phaser.Math.Between(0, config.height - 32);
    graphics.setPosition(randomX, randomY);
  }
}

// 启动游戏
new Phaser.Game(config);