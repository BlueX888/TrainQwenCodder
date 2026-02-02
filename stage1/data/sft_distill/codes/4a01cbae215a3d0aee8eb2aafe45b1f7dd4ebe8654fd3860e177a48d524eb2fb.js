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
  // 创建5个粉色圆形
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const circle = this.add.graphics();
    
    // 设置粉色填充（粉色色值：0xff69b4）
    circle.fillStyle(0xff69b4, 1);
    
    // 绘制圆形，圆心在(0, 0)，半径为24（直径48）
    circle.fillCircle(0, 0, 24);
    
    // 随机设置圆形位置
    // 确保圆形完全在画布内，留出半径的边距
    circle.setRandomPosition(24, 24, 800 - 48, 600 - 48);
  }
}

new Phaser.Game(config);