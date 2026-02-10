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
  // 绘制8个随机位置的黄色矩形
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充样式
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制 24x24 的矩形，以中心为原点（-12, -12）
    graphics.fillRect(-12, -12, 24, 24);
    
    // 设置随机位置（考虑边界，避免矩形超出画布）
    const x = Phaser.Math.Between(12, 800 - 12);
    const y = Phaser.Math.Between(12, 600 - 12);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);