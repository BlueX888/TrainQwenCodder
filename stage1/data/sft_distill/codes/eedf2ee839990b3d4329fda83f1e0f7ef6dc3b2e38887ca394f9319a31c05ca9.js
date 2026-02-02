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
  // 绘制12个随机位置的黄色圆形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置黄色填充样式
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制圆形，半径为24（直径48像素）
    graphics.fillCircle(0, 0, 24);
    
    // 生成随机位置
    // x: 24 到 776（确保圆形完全在画布内）
    // y: 24 到 576（确保圆形完全在画布内）
    const randomX = 24 + Math.random() * (800 - 48);
    const randomY = 24 + Math.random() * (600 - 48);
    
    // 设置 Graphics 对象位置
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);