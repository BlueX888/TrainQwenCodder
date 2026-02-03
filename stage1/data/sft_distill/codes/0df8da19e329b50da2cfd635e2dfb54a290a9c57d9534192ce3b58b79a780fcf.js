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
  // 绘制12个随机位置的灰色六边形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置灰色填充
    graphics.fillStyle(0x808080, 1);
    
    // 六边形参数
    const size = 32; // 六边形大小（顶点到中心的距离）
    const radius = size / 2; // 半径为16像素
    
    // 随机位置（留出边距避免六边形被裁剪）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 计算六边形的6个顶点并绘制
    // 从顶部顶点开始，逆时针绘制
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI / 3) * j - Math.PI / 2; // 每个顶点间隔60度，起始角度-90度
      const vx = x + radius * Math.cos(angle);
      const vy = y + radius * Math.sin(angle);
      
      if (j === 0) {
        graphics.moveTo(vx, vy);
      } else {
        graphics.lineTo(vx, vy);
      }
    }
    
    // 闭合路径
    graphics.closePath();
    
    // 填充路径
    graphics.fillPath();
  }
}

new Phaser.Game(config);