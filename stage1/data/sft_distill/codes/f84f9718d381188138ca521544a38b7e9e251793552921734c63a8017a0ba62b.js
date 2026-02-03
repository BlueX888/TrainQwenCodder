const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 橙色的十六进制颜色值
  const orangeColor = 0xFFA500;
  
  // 圆形半径（直径16像素，半径为8像素）
  const radius = 8;
  
  // 创建3个随机位置的橙色圆形
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const circle = this.add.graphics();
    
    // 设置填充颜色为橙色
    circle.fillStyle(orangeColor, 1);
    
    // 绘制圆形（圆心在原点）
    circle.fillCircle(0, 0, radius);
    
    // 设置随机位置（考虑边界，避免圆形被裁剪）
    const randomX = Phaser.Math.Between(radius, config.width - radius);
    const randomY = Phaser.Math.Between(radius, config.height - radius);
    circle.setPosition(randomX, randomY);
  }
}

// 创建游戏实例
new Phaser.Game(config);