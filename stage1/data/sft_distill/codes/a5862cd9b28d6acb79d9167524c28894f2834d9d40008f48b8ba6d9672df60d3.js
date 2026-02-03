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
  // 六边形参数
  const hexSize = 32; // 六边形大小（从中心到顶点的距离）
  const hexCount = 12; // 六边形数量
  
  // 创建12个随机位置的白色六边形
  for (let i = 0; i < hexCount; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置白色填充
    graphics.fillStyle(0xffffff, 1);
    
    // 随机位置（确保六边形完全在画布内）
    const x = Phaser.Math.Between(hexSize, 800 - hexSize);
    const y = Phaser.Math.Between(hexSize, 600 - hexSize);
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 绘制六边形的6个顶点
    // 六边形的每个角度间隔为 60度（Math.PI / 3）
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI / 3) * j - Math.PI / 2; // 从顶部开始绘制
      const px = x + hexSize * Math.cos(angle);
      const py = y + hexSize * Math.sin(angle);
      
      if (j === 0) {
        graphics.moveTo(px, py);
      } else {
        graphics.lineTo(px, py);
      }
    }
    
    // 闭合路径
    graphics.closePath();
    
    // 填充六边形
    graphics.fillPath();
  }
}

new Phaser.Game(config);