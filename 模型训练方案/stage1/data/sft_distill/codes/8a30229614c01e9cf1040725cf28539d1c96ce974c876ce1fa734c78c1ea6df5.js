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
  
  // 设置青色填充样式 (cyan: 0x00ffff)
  graphics.fillStyle(0x00ffff, 1);
  
  // 画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 星形参数
  const outerRadius = 40; // 外半径 40px，总大小约 80px
  const innerRadius = 18; // 内半径约为外半径的 0.45 倍
  const points = 5; // 五角星
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 绘制星形的各个顶点
  for (let i = 0; i < points * 2; i++) {
    // 交替使用外半径和内半径
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    // 计算角度（从顶部开始，逆时针旋转）
    const angle = (i * Math.PI) / points - Math.PI / 2;
    
    // 计算顶点坐标
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
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