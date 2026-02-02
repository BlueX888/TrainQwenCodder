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
  
  // 设置填充颜色为橙色
  graphics.fillStyle(0xFF8C00, 1);
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 星形参数
  const outerRadius = 40; // 外半径 40 像素，总直径约 80 像素
  const innerRadius = 16; // 内半径，约为外半径的 0.4 倍
  const points = 5; // 五角星
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算并绘制星形的各个顶点
  for (let i = 0; i < points * 2; i++) {
    // 交替使用外半径和内半径
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    // 计算角度（从正上方开始，顺时针旋转）
    const angle = (i * Math.PI) / points - Math.PI / 2;
    
    // 计算顶点坐标
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
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