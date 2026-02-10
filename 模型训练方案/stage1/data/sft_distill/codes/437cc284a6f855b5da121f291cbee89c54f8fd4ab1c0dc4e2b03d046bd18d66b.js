const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 循环创建10个灰色方块
  for (let i = 0; i < 10; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置灰色填充样式
    graphics.fillStyle(0x808080, 1);
    
    // 生成随机位置（确保方块完全在画布内）
    const x = Phaser.Math.Between(0, config.width - 24);
    const y = Phaser.Math.Between(0, config.height - 24);
    
    // 绘制 24x24 像素的方块
    graphics.fillRect(x, y, 24, 24);
  }
}

new Phaser.Game(config);