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
  // 循环创建8个粉色圆形
  for (let i = 0; i < 8; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置粉色填充样式（#ff69b4）
    graphics.fillStyle(0xff69b4, 1);
    
    // 绘制圆形，半径为8（直径16像素）
    // 圆心在 (0, 0)，后续通过 setRandomPosition 移动整个 Graphics 对象
    graphics.fillCircle(0, 0, 8);
    
    // 随机设置位置
    // 考虑圆形半径，确保圆形完全在画布内
    graphics.setRandomPosition(8, 8, 800 - 16, 600 - 16);
  }
}

new Phaser.Game(config);