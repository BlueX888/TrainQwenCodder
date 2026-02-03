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
  // 绘制12个随机位置的黄色圆形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充样式
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制圆形，半径为24像素（直径48像素）
    // 圆心在 (0, 0)，后续通过 setPosition 移动
    graphics.fillCircle(0, 0, 24);
    
    // 生成随机位置
    // x: 24 到 776 (确保圆形不超出画布边界)
    // y: 24 到 576 (确保圆形不超出画布边界)
    const randomX = 24 + Math.random() * (800 - 48);
    const randomY = 24 + Math.random() * (600 - 48);
    
    // 设置圆形位置
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);