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
  // 循环创建8个红色矩形
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置红色填充样式
    graphics.fillStyle(0xff0000, 1);
    
    // 生成随机位置（确保矩形完全在画布内）
    const x = Phaser.Math.Between(0, 800 - 32);
    const y = Phaser.Math.Between(0, 600 - 32);
    
    // 绘制 32x32 的矩形
    graphics.fillRect(x, y, 32, 32);
  }
}

new Phaser.Game(config);