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
  // 不需要预加载外部资源
}

function create() {
  // 圆形半径
  const radius = 24; // 直径48像素，半径24像素
  
  // 计算有效的随机位置范围（避免圆形超出边界）
  const minX = radius;
  const maxX = this.scale.width - radius;
  const minY = radius;
  const maxY = this.scale.height - radius;
  
  // 创建12个黄色圆形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const circle = this.add.graphics();
    
    // 设置黄色填充
    circle.fillStyle(0xffff00, 1);
    
    // 绘制圆形（相对于 Graphics 对象的原点）
    circle.fillCircle(0, 0, radius);
    
    // 设置随机位置
    const randomX = Phaser.Math.Between(minX, maxX);
    const randomY = Phaser.Math.Between(minY, maxY);
    circle.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);