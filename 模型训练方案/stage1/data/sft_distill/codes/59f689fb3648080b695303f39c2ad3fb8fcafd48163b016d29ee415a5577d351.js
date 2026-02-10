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
  // 创建 Graphics 对象用于绘制矩形
  const graphics = this.add.graphics();
  
  // 设置粉色填充颜色 (0xff69b4 是粉色的十六进制值)
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制10个随机位置的矩形
  for (let i = 0; i < 10; i++) {
    // 生成随机坐标，确保矩形完全在画布内
    // x: 0 到 (800 - 64)，y: 0 到 (600 - 64)
    const x = Phaser.Math.Between(0, 736);
    const y = Phaser.Math.Between(0, 536);
    
    // 绘制 64x64 的矩形
    graphics.fillRect(x, y, 64, 64);
  }
}

new Phaser.Game(config);