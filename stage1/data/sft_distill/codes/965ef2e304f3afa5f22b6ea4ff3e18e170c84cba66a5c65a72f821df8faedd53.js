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
  // 方块尺寸
  const squareSize = 48;
  
  // 创建5个橙色方块
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置橙色填充
    graphics.fillStyle(0xff8800, 1);
    
    // 绘制方块（以左上角为原点）
    graphics.fillRect(0, 0, squareSize, squareSize);
    
    // 生成随机位置（确保方块完全在画布内）
    const randomX = Phaser.Math.Between(0, config.width - squareSize);
    const randomY = Phaser.Math.Between(0, config.height - squareSize);
    
    // 设置方块位置
    graphics.setPosition(randomX, randomY);
  }
}

// 启动游戏
new Phaser.Game(config);