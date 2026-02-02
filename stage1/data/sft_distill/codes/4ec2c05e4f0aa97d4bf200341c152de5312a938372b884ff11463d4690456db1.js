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
  // 本示例不需要预加载外部资源
}

function create() {
  const squareSize = 48;
  const squareCount = 5;
  const orangeColor = 0xFFA500; // 橙色
  
  // 创建5个随机位置的橙色方块
  for (let i = 0; i < squareCount; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置橙色填充样式
    graphics.fillStyle(orangeColor, 1);
    
    // 绘制方块（以中心点为原点，方便后续定位）
    graphics.fillRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
    
    // 设置随机位置
    // 确保方块完全在画布内（留出边距）
    const margin = squareSize / 2;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    
    graphics.setPosition(randomX, randomY);
  }
}

// 启动游戏
new Phaser.Game(config);