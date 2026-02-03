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
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 星形参数
  const outerRadius = 16; // 外半径
  const innerRadius = 8;  // 内半径
  const points = 5;       // 五角星
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 绘制星形的顶点
  for (let i = 0; i < points * 2; i++) {
    // 交替使用外半径和内半径
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    // 计算角度（从顶部开始，顺时针）
    const angle = (i * Math.PI) / points - Math.PI / 2;
    
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