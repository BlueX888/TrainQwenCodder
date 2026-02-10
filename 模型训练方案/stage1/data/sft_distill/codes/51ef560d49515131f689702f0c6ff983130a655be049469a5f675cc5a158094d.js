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
  // 循环创建 20 个粉色椭圆
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充样式 (粉色 RGB: 255, 192, 203 -> Hex: 0xFFC0CB)
    graphics.fillStyle(0xFFC0CB, 1);
    
    // 绘制椭圆，中心点在 (0, 0)，宽高各为 64 像素（半径 32）
    graphics.fillEllipse(0, 0, 64, 64);
    
    // 随机设置椭圆位置
    // 确保椭圆完全在画布内，留出半径的边距
    graphics.setRandomPosition(32, 32, this.scale.width - 64, this.scale.height - 64);
  }
}

new Phaser.Game(config);