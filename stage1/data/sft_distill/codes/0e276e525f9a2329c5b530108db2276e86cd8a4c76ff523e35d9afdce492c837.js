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
  // 绘制10个随机位置的灰色六边形
  for (let i = 0; i < 10; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置灰色填充
    graphics.fillStyle(0x808080, 1);
    
    // 六边形参数
    const radius = 16; // 半径16像素，使得六边形大小约为32像素
    const sides = 6;
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 计算六边形的各个顶点
    for (let j = 0; j < sides; j++) {
      const angle = (Math.PI / 3) * j; // 每个角60度
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      if (j === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    // 闭合路径
    graphics.closePath();
    
    // 填充路径
    graphics.fillPath();
    
    // 设置随机位置（确保六边形完全在画布内）
    const randomX = Phaser.Math.Between(50, 750);
    const randomY = Phaser.Math.Between(50, 550);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);