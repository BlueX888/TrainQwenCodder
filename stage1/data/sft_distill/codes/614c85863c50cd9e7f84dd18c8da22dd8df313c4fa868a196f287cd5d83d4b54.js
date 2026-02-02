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
  const graphics = this.add.graphics();
  
  // 星形参数
  const centerX = 400;
  const centerY = 300;
  const outerRadius = 24; // 外半径 24 像素，总大小约 48 像素
  const innerRadius = 10; // 内半径
  const points = 5; // 五角星
  
  // 设置填充颜色为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算星形的顶点坐标
  for (let i = 0; i < points * 2; i++) {
    // 每个点的角度（从顶部开始，逆时针）
    const angle = (i * Math.PI) / points - Math.PI / 2;
    
    // 交替使用外半径和内半径
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    // 计算顶点坐标
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // 第一个点使用 moveTo，其余使用 lineTo
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