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
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置紫色填充样式
  graphics.fillStyle(0x800080, 1);
  
  // 绘制10个随机位置的矩形
  for (let i = 0; i < 10; i++) {
    // 生成随机位置，确保矩形完全在画布内
    // x: 0 到 (800 - 24)
    // y: 0 到 (600 - 24)
    const x = Math.random() * (this.cameras.main.width - 24);
    const y = Math.random() * (this.cameras.main.height - 24);
    
    // 绘制 24x24 的矩形
    graphics.fillRect(x, y, 24, 24);
  }
}

new Phaser.Game(config);