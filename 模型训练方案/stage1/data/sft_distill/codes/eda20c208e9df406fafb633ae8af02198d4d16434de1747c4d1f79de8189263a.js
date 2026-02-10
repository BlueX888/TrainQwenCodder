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
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 计算六边形参数
  const centerX = 400; // 画布中心 X
  const centerY = 300; // 画布中心 Y
  const radius = 40;   // 六边形外接圆半径（总大小约 80 像素）
  const sides = 6;     // 六边形有 6 条边
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算并绘制六边形的 6 个顶点
  for (let i = 0; i < sides; i++) {
    // 六边形顶点角度（从顶部开始，逆时针）
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y); // 移动到第一个顶点
    } else {
      graphics.lineTo(x, y); // 连线到下一个顶点
    }
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);