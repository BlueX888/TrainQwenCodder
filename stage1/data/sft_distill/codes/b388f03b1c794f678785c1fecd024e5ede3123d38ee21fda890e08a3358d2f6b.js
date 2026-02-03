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
  // 橙色的十六进制值
  const orangeColor = 0xFFA500;
  const circleRadius = 8; // 半径为8像素，直径为16像素
  
  // 创建3个随机位置的橙色圆形
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充样式为橙色
    graphics.fillStyle(orangeColor, 1);
    
    // 绘制圆形（圆心在原点，半径为8）
    graphics.fillCircle(0, 0, circleRadius);
    
    // 设置随机位置（考虑圆形半径，避免超出边界）
    const randomX = Phaser.Math.Between(circleRadius, config.width - circleRadius);
    const randomY = Phaser.Math.Between(circleRadius, config.height - circleRadius);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);