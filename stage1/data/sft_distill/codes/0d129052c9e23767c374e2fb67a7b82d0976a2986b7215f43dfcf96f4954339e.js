const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#ffffff'
};

function preload() {
  // 无需预加载资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 六边形半径（从中心到顶点的距离）
  const radius = 24;
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算并绘制六边形的六个顶点
  // 六边形的顶点角度：0°, 60°, 120°, 180°, 240°, 300°
  for (let i = 0; i < 6; i++) {
    // 角度转弧度，从顶部开始（-90度偏移）
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);