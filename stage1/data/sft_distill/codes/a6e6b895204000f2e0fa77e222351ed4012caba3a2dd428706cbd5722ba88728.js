const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 循环创建5个粉色圆形
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const circle = this.add.graphics();
    
    // 设置粉色填充样式（粉色 #FFC0CB）
    circle.fillStyle(0xFFC0CB, 1);
    
    // 绘制圆形，圆心在 (0, 0)，半径为 32（直径 64 像素）
    circle.fillCircle(0, 0, 32);
    
    // 随机设置圆形位置
    // 确保圆形完全在场景内（考虑半径 32）
    const x = Phaser.Math.Between(32, 800 - 32);
    const y = Phaser.Math.Between(32, 600 - 32);
    circle.setPosition(x, y);
  }
}

new Phaser.Game(config);