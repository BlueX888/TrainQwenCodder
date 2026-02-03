const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制方块
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 方块大小
  const squareSize = 48;
  
  // 计算随机位置的最大范围（避免方块超出画布）
  const maxX = config.width - squareSize;
  const maxY = config.height - squareSize;
  
  // 绘制5个随机位置的橙色方块
  for (let i = 0; i < 5; i++) {
    // 生成随机坐标
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    
    // 绘制方块
    graphics.fillRect(randomX, randomY, squareSize, squareSize);
  }
}

new Phaser.Game(config);