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
  // 不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置橙色填充 (RGB: 255, 165, 0)
  graphics.fillStyle(0xFFA500, 1);
  
  // 方块大小
  const squareSize = 48;
  
  // 绘制 5 个随机位置的橙色方块
  for (let i = 0; i < 5; i++) {
    // 生成随机坐标，确保方块完全在画布内
    const x = Phaser.Math.Between(0, config.width - squareSize);
    const y = Phaser.Math.Between(0, config.height - squareSize);
    
    // 绘制方块
    graphics.fillRect(x, y, squareSize, squareSize);
  }
}

new Phaser.Game(config);