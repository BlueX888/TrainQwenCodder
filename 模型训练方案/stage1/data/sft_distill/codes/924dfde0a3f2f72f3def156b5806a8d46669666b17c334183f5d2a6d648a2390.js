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
  
  // 设置白色填充样式
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制15个随机位置的矩形
  for (let i = 0; i < 15; i++) {
    // 生成随机位置，确保矩形不会超出画布边界
    // x 范围: 0 到 (800 - 48)
    // y 范围: 0 到 (600 - 48)
    const x = Phaser.Math.Between(0, config.width - 48);
    const y = Phaser.Math.Between(0, config.height - 48);
    
    // 绘制 48x48 的白色矩形
    graphics.fillRect(x, y, 48, 48);
  }
}

// 启动游戏
new Phaser.Game(config);