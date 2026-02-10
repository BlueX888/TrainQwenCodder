const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制方块
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 方块大小
  const squareSize = 48;
  
  // 绘制5个随机位置的橙色方块
  for (let i = 0; i < 5; i++) {
    // 生成随机坐标，确保方块完全在画布内
    const x = Math.random() * (config.width - squareSize);
    const y = Math.random() * (config.height - squareSize);
    
    // 绘制方块
    graphics.fillRect(x, y, squareSize, squareSize);
  }
}

new Phaser.Game(config);