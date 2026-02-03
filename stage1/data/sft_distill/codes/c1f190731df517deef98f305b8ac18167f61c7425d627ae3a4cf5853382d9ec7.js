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
  const radius = 24; // 半径24像素，直径48像素
  const pinkColor = 0xff69b4; // 粉色
  
  // 创建5个随机位置的粉色圆形
  for (let i = 0; i < 5; i++) {
    const graphics = this.add.graphics();
    
    // 设置粉色填充样式
    graphics.fillStyle(pinkColor, 1);
    
    // 绘制圆形（圆心在0,0，半径24）
    graphics.fillCircle(0, 0, radius);
    
    // 设置随机位置，确保圆形完全在画布内
    // x范围: radius 到 width - radius
    // y范围: radius 到 height - radius
    const randomX = Phaser.Math.Between(radius, this.scale.width - radius);
    const randomY = Phaser.Math.Between(radius, this.scale.height - radius);
    
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);