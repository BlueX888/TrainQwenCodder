const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 绘制12个随机位置的白色六边形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置白色描边样式
    graphics.lineStyle(2, 0xffffff, 1);
    
    // 六边形参数
    const radius = 16; // 半径16像素，使得六边形大小约为32像素
    const sides = 6;
    const angle = (Math.PI * 2) / sides;
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 计算六边形的顶点并绘制
    for (let j = 0; j < sides; j++) {
      const x = radius * Math.cos(angle * j - Math.PI / 2);
      const y = radius * Math.sin(angle * j - Math.PI / 2);
      
      if (j === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    // 闭合路径
    graphics.closePath();
    
    // 描边路径
    graphics.strokePath();
    
    // 设置随机位置（留出边距避免六边形被裁剪）
    const randomX = Phaser.Math.Between(50, 750);
    const randomY = Phaser.Math.Between(50, 550);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);