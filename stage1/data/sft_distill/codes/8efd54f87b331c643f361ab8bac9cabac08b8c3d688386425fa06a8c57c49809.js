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
  const graphics = this.add.graphics();
  
  // 星形参数
  const centerX = 400;
  const centerY = 300;
  const outerRadius = 32; // 外半径
  const innerRadius = 14; // 内半径（约为外半径的 0.4-0.5）
  const points = 5; // 五角星
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1); // 粉色 (hot pink)
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算星形的顶点坐标
  for (let i = 0; i < points * 2; i++) {
    // 每个点的角度（从顶部开始，顺时针）
    const angle = (Math.PI / points) * i - Math.PI / 2;
    
    // 奇数点使用外半径，偶数点使用内半径
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
  
  // 可选：添加描边使星形更清晰
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokePath();
}

new Phaser.Game(config);