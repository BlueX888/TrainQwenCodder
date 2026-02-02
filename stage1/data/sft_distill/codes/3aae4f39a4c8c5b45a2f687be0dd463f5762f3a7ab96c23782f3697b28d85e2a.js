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
  // 创建 Graphics 对象用于绘制方块
  const graphics = this.add.graphics();
  
  // 设置橙色填充颜色 (橙色: 0xFFA500)
  graphics.fillStyle(0xFFA500, 1);
  
  // 方块大小
  const squareSize = 64;
  
  // 绘制15个随机位置的方块
  for (let i = 0; i < 15; i++) {
    // 生成随机坐标，确保方块完全在画布内
    const randomX = Phaser.Math.Between(0, config.width - squareSize);
    const randomY = Phaser.Math.Between(0, config.height - squareSize);
    
    // 绘制方块
    graphics.fillRect(randomX, randomY, squareSize, squareSize);
  }
}

// 启动游戏
new Phaser.Game(config);