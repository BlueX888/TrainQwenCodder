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
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 星形参数
  const outerRadius = 40; // 外半径（星形尖端）
  const innerRadius = 16; // 内半径（星形凹陷处）
  const points = 5; // 五角星
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算星形各顶点坐标并绘制
  for (let i = 0; i < points * 2; i++) {
    // 每个点的角度（从顶部开始，逆时针）
    const angle = (i * Math.PI) / points - Math.PI / 2;
    
    // 奇数点使用外半径，偶数点使用内半径
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    // 计算点的坐标
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // 第一个点使用 moveTo，其他点使用 lineTo
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充星形
  graphics.fillPath();
}

new Phaser.Game(config);