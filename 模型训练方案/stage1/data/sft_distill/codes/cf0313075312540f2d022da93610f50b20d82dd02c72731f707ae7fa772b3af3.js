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
  // 创建3个随机位置的青色圆形
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置青色填充样式（0x00ffff 是青色的十六进制值）
    graphics.fillStyle(0x00ffff, 1);
    
    // 绘制圆形，半径为40像素（直径80像素）
    // 圆心在 (0, 0)，因为会通过 setRandomPosition 设置位置
    graphics.fillCircle(0, 0, 40);
    
    // 设置随机位置
    // 确保圆形完全在画布内（考虑半径40像素的偏移）
    graphics.setRandomPosition(40, 40, 800 - 80, 600 - 80);
  }
}

new Phaser.Game(config);