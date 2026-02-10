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
  // 创建10个随机位置的紫色方块
  for (let i = 0; i < 10; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置紫色填充样式
    graphics.fillStyle(0x800080, 1);
    
    // 生成随机位置（确保方块完全在画布内）
    // x 范围: 0 到 (800 - 64)
    // y 范围: 0 到 (600 - 64)
    const randomX = Math.random() * (config.width - 64);
    const randomY = Math.random() * (config.height - 64);
    
    // 绘制 64x64 的矩形
    graphics.fillRect(randomX, randomY, 64, 64);
  }
}

new Phaser.Game(config);