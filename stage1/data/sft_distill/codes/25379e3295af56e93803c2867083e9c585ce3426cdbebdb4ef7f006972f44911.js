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
  // 绘制3个随机位置的紫色六边形
  for (let i = 0; i < 3; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x9932cc, 1);
    
    // 六边形参数
    const radius = 32; // 半径32像素，直径64像素
    const sides = 6;
    
    // 生成随机位置（考虑边界，留出半径空间）
    const x = Phaser.Math.Between(radius + 10, 800 - radius - 10);
    const y = Phaser.Math.Between(radius + 10, 600 - radius - 10);
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 计算六边形的顶点并绘制
    for (let j = 0; j < sides; j++) {
      // 计算每个顶点的角度（从顶部开始，所以减去90度）
      const angle = (Math.PI * 2 / sides) * j - Math.PI / 2;
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