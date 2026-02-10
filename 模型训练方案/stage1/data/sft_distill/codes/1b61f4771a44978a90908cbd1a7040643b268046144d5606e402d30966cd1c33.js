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
  // 无需预加载外部资源
}

function create() {
  // 绘制15个随机位置的紫色六边形
  for (let i = 0; i < 15; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x9966ff, 1);
    
    // 六边形半径（大小64像素，半径32像素）
    const radius = 32;
    
    // 随机位置（确保六边形完全在画布内）
    const x = Phaser.Math.Between(radius, config.width - radius);
    const y = Phaser.Math.Between(radius, config.height - radius);
    
    // 绘制六边形
    graphics.beginPath();
    
    // 计算六边形的6个顶点（从顶部开始，顺时针）
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI / 3) * j - Math.PI / 2; // 从顶部开始（-90度）
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