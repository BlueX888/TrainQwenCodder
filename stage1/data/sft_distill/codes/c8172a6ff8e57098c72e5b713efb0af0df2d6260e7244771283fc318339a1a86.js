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
  // 创建12个黄色圆形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const circle = this.add.graphics();
    
    // 设置填充样式为黄色
    circle.fillStyle(0xffff00, 1);
    
    // 绘制圆形，半径为24（直径48像素）
    // 圆心在 (0, 0)，这样随机位置时圆心就是定位点
    circle.fillCircle(0, 0, 24);
    
    // 设置随机位置
    // 考虑圆形半径，确保圆形完全在画布内
    circle.setRandomPosition(24, 24, 800 - 48, 600 - 48);
  }
}

new Phaser.Game(config);