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
  // 创建 Graphics 对象用于绘制矩形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制8个随机位置的红色矩形
  for (let i = 0; i < 8; i++) {
    // 生成随机位置，确保32x32的矩形完全在画布内
    // x 范围: 0 到 (800 - 32)
    // y 范围: 0 到 (600 - 32)
    const randomX = Math.random() * (config.width - 32);
    const randomY = Math.random() * (config.height - 32);
    
    // 绘制 32x32 的矩形
    graphics.fillRect(randomX, randomY, 32, 32);
  }
}

// 启动游戏
new Phaser.Game(config);