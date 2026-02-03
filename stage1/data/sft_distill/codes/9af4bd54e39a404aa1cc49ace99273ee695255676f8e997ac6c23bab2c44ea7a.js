const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  const squareSize = 64;
  const squareCount = 15;
  const orangeColor = 0xFFA500; // 橙色
  
  // 绘制15个随机位置的橙色方块
  for (let i = 0; i < squareCount; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为橙色
    graphics.fillStyle(orangeColor, 1);
    
    // 生成随机位置（确保方块完全在画布内）
    const randomX = Phaser.Math.Between(0, config.width - squareSize);
    const randomY = Phaser.Math.Between(0, config.height - squareSize);
    
    // 绘制方块
    graphics.fillRect(randomX, randomY, squareSize, squareSize);
  }
}

new Phaser.Game(config);