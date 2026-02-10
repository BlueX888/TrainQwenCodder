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
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 星形参数
  const outerRadius = 40; // 外半径 40px，总大小约 80px
  const innerRadius = 16; // 内半径（约为外半径的 40%）
  const points = 5; // 五角星
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算星形的顶点并绘制
  for (let i = 0; i < points * 2; i++) {
    // 每个点的角度（交替使用外半径和内半径）
    const angle = (i * Math.PI) / points - Math.PI / 2; // 从顶部开始
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
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