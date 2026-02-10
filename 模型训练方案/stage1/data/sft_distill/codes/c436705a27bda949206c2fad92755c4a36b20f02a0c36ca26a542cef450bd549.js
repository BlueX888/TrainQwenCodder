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
  // 无需预加载资源
}

function create() {
  // 创建3个蓝色方块
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置蓝色填充样式 (RGB: 0, 0, 255)
    graphics.fillStyle(0x0000ff, 1);
    
    // 绘制 32x32 的矩形，以中心点为原点
    graphics.fillRect(-16, -16, 32, 32);
    
    // 设置随机位置
    // 确保方块完全在画布内（边距16像素）
    graphics.setRandomPosition(16, 16, 800 - 32, 600 - 32);
  }
}

// 启动游戏
new Phaser.Game(config);