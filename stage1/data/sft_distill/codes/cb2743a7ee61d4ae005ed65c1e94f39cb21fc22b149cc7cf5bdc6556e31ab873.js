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
  
  // 设置填充颜色为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 星形参数
  const outerRadius = 24; // 外半径 24 像素（总大小约 48 像素）
  const innerRadius = 12; // 内半径约为外半径的一半
  const points = 5; // 五角星
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算并绘制星形的顶点
  for (let i = 0; i < points * 2; i++) {
    // 角度：每个顶点间隔 36 度（360 / 10）
    const angle = (i * Math.PI) / points - Math.PI / 2; // 从顶部开始
    
    // 交替使用外半径和内半径
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    // 计算顶点坐标
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
  
  // 添加文本说明（可选）
  this.add.text(centerX, centerY + 50, 'White Star (48px)', {
    fontSize: '16px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);