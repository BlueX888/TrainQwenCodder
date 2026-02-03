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
  // 创建8个黄色矩形
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充样式 (0xFFFF00 是黄色的十六进制值)
    graphics.fillStyle(0xFFFF00, 1);
    
    // 绘制 24x24 像素的矩形，以 (0, 0) 为起点
    graphics.fillRect(0, 0, 24, 24);
    
    // 将矩形随机放置在画布范围内
    // 减去24像素确保矩形完全显示在画布内
    graphics.setRandomPosition(0, 0, config.width - 24, config.height - 24);
  }
}

// 启动游戏
new Phaser.Game(config);