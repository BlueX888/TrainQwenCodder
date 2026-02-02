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
  // 无需预加载外部资源
}

function create() {
  const squareSize = 64;
  const squareCount = 15;
  const orangeColor = 0xFFA500;
  
  // 绘制15个随机位置的橙色方块
  for (let i = 0; i < squareCount; i++) {
    // 生成随机位置，确保方块完全在画布内
    const x = Phaser.Math.Between(0, this.game.config.width - squareSize);
    const y = Phaser.Math.Between(0, this.game.config.height - squareSize);
    
    // 创建 Graphics 对象并绘制方块
    const graphics = this.add.graphics();
    graphics.fillStyle(orangeColor, 1);
    graphics.fillRect(x, y, squareSize, squareSize);
  }
}

new Phaser.Game(config);