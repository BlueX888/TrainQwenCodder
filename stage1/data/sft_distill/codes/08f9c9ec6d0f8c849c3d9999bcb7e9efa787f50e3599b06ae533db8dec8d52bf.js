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
  // 创建3个随机位置的青色圆形
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const circle = this.add.graphics();
    
    // 设置青色填充样式 (cyan)
    circle.fillStyle(0x00ffff, 1);
    
    // 绘制圆形，半径为40（直径80）
    // fillCircle(x, y, radius) - 相对于 Graphics 对象的坐标
    circle.fillCircle(0, 0, 40);
    
    // 设置随机位置
    // 确保圆形完全在画布内（留出半径的边距）
    circle.setRandomPosition(40, 40, 800 - 80, 600 - 80);
  }
}

new Phaser.Game(config);