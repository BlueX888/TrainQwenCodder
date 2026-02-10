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
  // 无需预加载外部资源
}

function create() {
  // 循环创建10个绿色椭圆
  for (let i = 0; i < 10; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置绿色填充
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制椭圆，中心点在(0, 0)，宽度和高度都是80像素
    // fillEllipse(x, y, width, height)
    graphics.fillEllipse(0, 0, 80, 80);
    
    // 随机放置在场景中
    // 考虑椭圆半径，确保不会超出边界
    const radius = 40; // 椭圆半径为80/2
    graphics.setRandomPosition(
      radius, 
      radius, 
      config.width - radius * 2, 
      config.height - radius * 2
    );
  }
}

new Phaser.Game(config);