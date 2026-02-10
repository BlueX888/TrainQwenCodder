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
  
  // 设置紫色填充（紫色的十六进制值为 0x800080 或类似）
  graphics.fillStyle(0x9932cc, 1); // 使用深兰花紫色
  
  // 绘制10个随机位置的矩形
  for (let i = 0; i < 10; i++) {
    // 生成随机位置，确保矩形完全在画布内
    // x 范围: 0 到 (800 - 24)
    // y 范围: 0 到 (600 - 24)
    const randomX = Math.random() * (config.width - 24);
    const randomY = Math.random() * (config.height - 24);
    
    // 绘制 24x24 的矩形
    graphics.fillRect(randomX, randomY, 24, 24);
  }
}

// 启动游戏
new Phaser.Game(config);