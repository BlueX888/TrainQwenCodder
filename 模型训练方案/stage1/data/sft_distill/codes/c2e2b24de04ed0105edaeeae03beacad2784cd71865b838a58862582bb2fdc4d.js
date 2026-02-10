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
  // 无需预加载资源
}

function create() {
  // 循环创建5个粉色圆形
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充样式
    graphics.fillStyle(0xff69b4, 1);
    
    // 绘制圆形，半径为32像素（直径64像素）
    // 圆心在(0, 0)，后续通过 setRandomPosition 移动整个 Graphics 对象
    graphics.fillCircle(0, 0, 32);
    
    // 设置随机位置
    // 考虑圆形半径，确保圆形完全在画布内
    // x: 32 到 768 (800 - 32)
    // y: 32 到 568 (600 - 32)
    graphics.setRandomPosition(32, 32, 768 - 32, 568 - 32);
  }
}

new Phaser.Game(config);