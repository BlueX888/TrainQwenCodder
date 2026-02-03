const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#ffffff'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建5个随机位置的粉色圆形
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const circle = this.add.graphics();
    
    // 设置粉色填充样式
    circle.fillStyle(0xff69b4, 1);
    
    // 绘制圆形，半径为 24（直径 48 像素）
    circle.fillCircle(0, 0, 24);
    
    // 设置随机位置
    // 确保圆形完全在画布内，留出半径的边距
    circle.setRandomPosition(24, 24, 800 - 48, 600 - 48);
  }
}

new Phaser.Game(config);