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
  // 获取画布中心坐标
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 星形参数
  const outerRadius = 48; // 外半径
  const innerRadius = 20; // 内半径
  const points = 5; // 五角星
  
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充样式为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算星形的顶点坐标并绘制
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
  
  // 填充星形
  graphics.fillPath();
}

new Phaser.Game(config);