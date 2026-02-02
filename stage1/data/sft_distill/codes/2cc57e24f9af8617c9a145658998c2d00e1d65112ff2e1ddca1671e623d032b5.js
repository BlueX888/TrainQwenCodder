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
  // 无需预加载外部资源
}

function create() {
  // 循环创建8个粉色圆形
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const circle = this.add.graphics();
    
    // 设置粉色填充样式（粉色：0xff69b4）
    circle.fillStyle(0xff69b4, 1);
    
    // 绘制圆形，半径为8像素（直径16像素）
    // fillCircle(x, y, radius) - 在相对坐标(0, 0)处绘制
    circle.fillCircle(0, 0, 8);
    
    // 设置随机位置
    // 确保圆形完全在画布内，留出半径的边距
    const margin = 8;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    circle.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);