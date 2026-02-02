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
  // 创建5个粉色圆形
  for (let i = 0; i < 5; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充样式
    graphics.fillStyle(0xff69b4, 1);
    
    // 绘制圆形，半径为24（直径48）
    // 圆心在 (0, 0)，这样随机位置时圆心会在指定坐标
    graphics.fillCircle(0, 0, 24);
    
    // 设置随机位置
    // 确保圆形完全在画布内（留出半径24的边距）
    const x = Phaser.Math.Between(24, 800 - 24);
    const y = Phaser.Math.Between(24, 600 - 24);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);