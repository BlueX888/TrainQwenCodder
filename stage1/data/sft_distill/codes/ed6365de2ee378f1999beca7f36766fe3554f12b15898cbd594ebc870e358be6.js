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
  
  // 设置黄色填充样式
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制8个随机位置的矩形
  for (let i = 0; i < 8; i++) {
    // 生成随机位置，确保矩形完全在画布内
    // x 范围: 0 到 (800 - 24)
    // y 范围: 0 到 (600 - 24)
    const x = Phaser.Math.Between(0, 800 - 24);
    const y = Phaser.Math.Between(0, 600 - 24);
    
    // 绘制 24x24 的矩形
    graphics.fillRect(x, y, 24, 24);
  }
}

// 启动游戏
new Phaser.Game(config);