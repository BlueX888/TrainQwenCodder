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
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 计算六边形参数
  const centerX = 400; // 画布中心 X
  const centerY = 300; // 画布中心 Y
  const radius = 40;   // 六边形半径（从中心到顶点的距离）
  const sides = 6;     // 六边形有 6 个边
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算并绘制六边形的六个顶点
  for (let i = 0; i < sides; i++) {
    // 计算当前顶点的角度（从顶部开始，逆时针）
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    
    // 计算顶点坐标
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // 第一个点使用 moveTo，后续点使用 lineTo
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