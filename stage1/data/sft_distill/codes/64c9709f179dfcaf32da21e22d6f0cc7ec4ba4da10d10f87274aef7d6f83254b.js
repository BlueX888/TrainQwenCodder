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
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 星形参数
  const outerRadius = 16; // 外半径
  const innerRadius = 7;  // 内半径（约为外半径的 0.4-0.5 倍）
  const points = 5;       // 五角星
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 绘制星形的各个顶点
  for (let i = 0; i < points * 2; i++) {
    // 计算角度（从顶部开始，逆时针）
    const angle = (Math.PI / points) * i - Math.PI / 2;
    
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