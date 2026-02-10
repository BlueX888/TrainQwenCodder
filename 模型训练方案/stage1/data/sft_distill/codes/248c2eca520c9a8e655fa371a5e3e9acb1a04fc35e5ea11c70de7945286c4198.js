const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 绘制8个随机位置的黄色方块
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充样式
    graphics.fillStyle(0xFFFF00, 1);
    
    // 绘制 24x24 的方块（以中心点为原点，所以偏移 -12）
    graphics.fillRect(-12, -12, 24, 24);
    
    // 生成随机位置（确保方块完全在画布内）
    const randomX = 12 + Math.random() * (800 - 24);
    const randomY = 12 + Math.random() * (600 - 24);
    
    // 设置方块位置
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);