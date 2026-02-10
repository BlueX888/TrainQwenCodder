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
  // 创建3个随机位置的紫色六边形
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x800080, 1);
    
    // 六边形参数
    const radius = 32; // 半径32像素，使整体大小为64像素
    const sides = 6;
    
    // 计算随机位置（确保六边形完全在画布内）
    const x = Phaser.Math.Between(radius + 10, 800 - radius - 10);
    const y = Phaser.Math.Between(radius + 10, 600 - radius - 10);
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 计算六边形的6个顶点
    for (let j = 0; j < sides; j++) {
      // 计算角度（从顶部开始，逆时针）
      const angle = (Math.PI / 3) * j - Math.PI / 2;
      const vx = x + radius * Math.cos(angle);
      const vy = y + radius * Math.sin(angle);
      
      if (j === 0) {
        graphics.moveTo(vx, vy);
      } else {
        graphics.lineTo(vx, vy);
      }
    }
    
    // 闭合路径并填充
    graphics.closePath();
    graphics.fillPath();
  }
}

new Phaser.Game(config);