const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 圆形半径
  const radius = 24; // 直径48像素
  
  // 绘制12个随机位置的黄色圆形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充样式
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制圆形（圆心在 (0, 0)）
    graphics.fillCircle(0, 0, radius);
    
    // 生成随机位置，确保圆形完全在画布内
    // x 范围: radius 到 width - radius
    // y 范围: radius 到 height - radius
    const randomX = radius + Math.random() * (this.game.config.width - 2 * radius);
    const randomY = radius + Math.random() * (this.game.config.height - 2 * radius);
    
    // 设置圆形位置
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);