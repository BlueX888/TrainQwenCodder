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
  // 创建3个随机位置的橙色椭圆
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置橙色填充样式
    graphics.fillStyle(0xFFA500, 1);
    
    // 绘制椭圆，中心点在(0,0)，宽度和高度均为64像素
    // fillEllipse(x, y, width, height)
    graphics.fillEllipse(0, 0, 64, 64);
    
    // 设置随机位置（考虑椭圆半径，避免超出边界）
    const randomX = Phaser.Math.Between(32, 768);
    const randomY = Phaser.Math.Between(32, 568);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);