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
  
  // 设置紫色填充
  graphics.fillStyle(0x9932CC, 1); // 紫色
  
  // 画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 六边形半径
  const radius = 24;
  
  // 绘制六边形
  graphics.beginPath();
  
  // 计算六个顶点（从顶部开始，顺时针）
  for (let i = 0; i < 6; i++) {
    // 角度：从 -90 度开始（顶部），每次增加 60 度
    const angle = (Math.PI / 180) * (-90 + i * 60);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
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