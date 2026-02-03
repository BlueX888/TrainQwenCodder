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
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 星形参数
  const outerRadius = 24; // 外半径 24 像素
  const innerRadius = outerRadius * 0.4; // 内半径约为外半径的 40%
  const points = 5; // 5 个角的星形
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 绘制星形的顶点
  for (let i = 0; i < points * 2; i++) {
    // 计算角度（从顶部开始，逆时针）
    const angle = (i * Math.PI) / points - Math.PI / 2;
    
    // 交替使用外半径和内半径
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    // 计算顶点坐标
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // 第一个点移动到该位置，其余点连线
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