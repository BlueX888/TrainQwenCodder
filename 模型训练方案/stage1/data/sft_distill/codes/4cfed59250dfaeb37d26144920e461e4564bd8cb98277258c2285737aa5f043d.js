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
  
  // 设置橙色填充 (0xFFA500 是标准橙色)
  graphics.fillStyle(0xFFA500, 1);
  
  // 方块大小
  const squareSize = 64;
  
  // 绘制15个随机位置的方块
  for (let i = 0; i < 15; i++) {
    // 生成随机坐标，确保方块完全在画布内
    const x = Math.random() * (config.width - squareSize);
    const y = Math.random() * (config.height - squareSize);
    
    // 绘制方块
    graphics.fillRect(x, y, squareSize, squareSize);
  }
}

// 启动游戏
new Phaser.Game(config);