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
  
  // 设置粉色填充样式
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 绘制10个随机位置的矩形
  for (let i = 0; i < 10; i++) {
    // 生成随机位置，确保矩形完全在画布内
    // x 范围: 0 到 (800 - 64)
    // y 范围: 0 到 (600 - 64)
    const x = Phaser.Math.Between(0, 736);
    const y = Phaser.Math.Between(0, 536);
    
    // 绘制 64x64 的矩形
    graphics.fillRect(x, y, 64, 64);
  }
}

new Phaser.Game(config);