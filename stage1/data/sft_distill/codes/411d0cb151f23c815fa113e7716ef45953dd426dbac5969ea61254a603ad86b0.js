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
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 星形参数
  const outerRadius = 24; // 外半径
  const innerRadius = 12; // 内半径
  const points = 5; // 五角星
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算星形的各个顶点
  for (let i = 0; i < points * 2; i++) {
    // 角度：每个点间隔 36 度（360 / 10）
    const angle = (i * Math.PI) / points - Math.PI / 2; // 从顶部开始
    
    // 奇数索引使用外半径，偶数索引使用内半径
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
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);