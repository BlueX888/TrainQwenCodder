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
  // 创建 12 个随机位置的黄色圆形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为黄色
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制圆形，半径为 24（直径 48）
    graphics.fillCircle(0, 0, 24);
    
    // 设置随机位置
    // 确保圆形完全在画布内（留出半径的边距）
    const x = Phaser.Math.Between(24, 800 - 24);
    const y = Phaser.Math.Between(24, 600 - 24);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);