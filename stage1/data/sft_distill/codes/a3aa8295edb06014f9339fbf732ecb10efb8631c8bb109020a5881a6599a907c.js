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
  // 循环创建3个蓝色方块
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置蓝色填充样式
    graphics.fillStyle(0x0000ff, 1);
    
    // 绘制 32x32 的方块
    graphics.fillRect(0, 0, 32, 32);
    
    // 生成随机位置（确保方块完全在画布内）
    // x: 0 到 (800 - 32)，y: 0 到 (600 - 32)
    const randomX = Math.random() * (800 - 32);
    const randomY = Math.random() * (600 - 32);
    
    // 设置方块位置
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);