const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建3个随机位置的橙色圆形
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置橙色填充
    graphics.fillStyle(0xffa500, 1);
    
    // 绘制圆形，半径为8（直径16像素）
    graphics.fillCircle(0, 0, 8);
    
    // 设置随机位置（考虑圆形半径，避免超出边界）
    graphics.setRandomPosition(8, 8, config.width - 16, config.height - 16);
  }
}

new Phaser.Game(config);