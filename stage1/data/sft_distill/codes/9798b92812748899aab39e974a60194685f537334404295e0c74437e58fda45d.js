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
  // 创建3个随机位置的青色矩形
  for (let i = 0; i < 3; i++) {
    const graphics = this.add.graphics();
    
    // 设置青色填充样式
    graphics.fillStyle(0x00ffff, 1);
    
    // 绘制16x16的矩形（从原点开始）
    graphics.fillRect(0, 0, 16, 16);
    
    // 设置随机位置（确保矩形完全在画布内）
    graphics.setRandomPosition(0, 0, 800 - 16, 600 - 16);
  }
}

new Phaser.Game(config);