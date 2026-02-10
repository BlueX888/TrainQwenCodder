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
  // 创建 Graphics 对象用于绘制矩形
  const graphics = this.add.graphics();
  
  // 设置橙色填充 (橙色的十六进制值)
  graphics.fillStyle(0xFFA500, 1);
  
  // 绘制20个随机位置的矩形
  for (let i = 0; i < 20; i++) {
    // 生成随机位置，确保矩形不会超出画布边界
    // x 范围: 0 到 (800 - 80)
    // y 范围: 0 到 (600 - 80)
    const x = Phaser.Math.Between(0, config.width - 80);
    const y = Phaser.Math.Between(0, config.height - 80);
    
    // 绘制 80x80 的矩形
    graphics.fillRect(x, y, 80, 80);
  }
}

// 创建游戏实例
new Phaser.Game(config);