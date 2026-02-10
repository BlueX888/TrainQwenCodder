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
  // 循环创建20个粉色椭圆
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充样式 (粉色 #FFC0CB 对应 0xFFC0CB)
    graphics.fillStyle(0xFFC0CB, 1);
    
    // 绘制椭圆：中心点在(0, 0)，半径为32（直径64）
    // fillEllipse(x, y, width, height)
    graphics.fillEllipse(0, 0, 64, 64);
    
    // 随机设置椭圆位置
    // 确保椭圆完全在画布内（留出半径32的边距）
    graphics.setRandomPosition(32, 32, config.width - 64, config.height - 64);
  }
}

new Phaser.Game(config);