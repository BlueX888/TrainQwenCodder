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
  
  // 设置填充颜色为绿色
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算六边形参数
  const centerX = 400; // 画布中心 X
  const centerY = 300; // 画布中心 Y
  const radius = 24;   // 半径 24 像素，直径约 48 像素
  const sides = 6;     // 六边形
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算并绘制六边形的 6 个顶点
  for (let i = 0; i < sides; i++) {
    // 计算角度（从顶部开始，顺时针）
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