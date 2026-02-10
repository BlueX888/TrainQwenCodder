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
  // 无需预加载资源
}

function create() {
  // 绘制8个随机位置的黄色方块
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 生成随机位置（确保方块完全在画布内）
    // x 范围: 0 到 (800 - 24)
    // y 范围: 0 到 (600 - 24)
    const randomX = Phaser.Math.Between(0, 776);
    const randomY = Phaser.Math.Between(0, 576);
    
    // 设置黄色填充
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制 24x24 的方块
    graphics.fillRect(randomX, randomY, 24, 24);
  }
}

new Phaser.Game(config);