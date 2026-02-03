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
  // 绘制12个随机位置的绿色六边形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置绿色填充
    graphics.fillStyle(0x00ff00, 1);
    
    // 六边形参数
    const radius = 8; // 半径8像素，直径16像素
    const sides = 6;
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 计算六边形的6个顶点
    for (let j = 0; j < sides; j++) {
      const angle = (Math.PI * 2 / sides) * j - Math.PI / 2; // 从顶部开始
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (j === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    // 闭合路径并填充
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（确保六边形完全在画布内）
    const randomX = radius + Math.random() * (800 - radius * 2);
    const randomY = radius + Math.random() * (600 - radius * 2);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);