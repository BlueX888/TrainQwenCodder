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
  // 创建 10 个随机位置的绿色椭圆
  for (let i = 0; i < 10; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为绿色
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制椭圆，中心点在 (0, 0)，半径为 40 像素（直径 80 像素）
    // fillEllipse(x, y, width, height)
    graphics.fillEllipse(0, 0, 80, 80);
    
    // 设置随机位置
    // 留出边距，确保椭圆完全显示在画布内
    const margin = 40;
    graphics.setPosition(
      Phaser.Math.Between(margin, config.width - margin),
      Phaser.Math.Between(margin, config.height - margin)
    );
  }
}

// 启动游戏
new Phaser.Game(config);