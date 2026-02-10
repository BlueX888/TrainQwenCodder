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
  // 创建3个橙色椭圆
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置橙色填充样式
    graphics.fillStyle(0xFFA500, 1);
    
    // 绘制椭圆（中心点在原点，半径为32，直径64）
    graphics.fillEllipse(0, 0, 64, 64);
    
    // 设置随机位置（考虑椭圆大小，避免超出边界）
    const randomX = Phaser.Math.Between(64, config.width - 64);
    const randomY = Phaser.Math.Between(64, config.height - 64);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);