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
  // 创建5个橙色方块
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置橙色填充样式 (橙色: #FFA500 或 0xFFA500)
    graphics.fillStyle(0xFFA500, 1);
    
    // 绘制 48x48 的方块（从原点开始）
    graphics.fillRect(0, 0, 48, 48);
    
    // 随机设置位置，确保方块完全在画布内
    // x: 0 到 (800 - 48)，y: 0 到 (600 - 48)
    const randomX = Phaser.Math.Between(0, config.width - 48);
    const randomY = Phaser.Math.Between(0, config.height - 48);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);