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
  // 创建 Graphics 对象用于绘制矩形
  const graphics = this.add.graphics();
  
  // 设置青色填充样式
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制3个随机位置的矩形
  for (let i = 0; i < 3; i++) {
    // 生成随机位置，确保矩形完全在画布内（减去矩形大小16）
    const randomX = Phaser.Math.Between(0, config.width - 16);
    const randomY = Phaser.Math.Between(0, config.height - 16);
    
    // 绘制 16x16 的矩形
    graphics.fillRect(randomX, randomY, 16, 16);
  }
}

// 创建游戏实例
new Phaser.Game(config);