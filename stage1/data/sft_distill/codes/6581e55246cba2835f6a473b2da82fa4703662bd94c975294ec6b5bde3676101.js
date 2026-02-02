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
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 星形参数
  const outerRadius = 16; // 外半径
  const innerRadius = 8;  // 内半径（约为外半径的一半）
  const points = 5;       // 五角星
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算星形顶点并绘制
  for (let i = 0; i < points * 2; i++) {
    // 每个点的角度（从正上方开始，顺时针）
    const angle = (i * Math.PI) / points - Math.PI / 2;
    
    // 交替使用外半径和内半径
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    // 计算顶点坐标
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // 第一个点移动到该位置，其他点连线
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
  
  // 添加文字说明
  this.add.text(centerX, centerY + 40, 'Orange Star (16px)', {
    fontSize: '16px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);