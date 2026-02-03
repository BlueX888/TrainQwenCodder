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
  graphics.fillStyle(0x9400D3, 1);
  
  // 画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 六边形半径（24 像素）
  const radius = 24;
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算并绘制六边形的六个顶点
  // 六边形的顶点角度间隔为 60 度（Math.PI / 3 弧度）
  for (let i = 0; i < 6; i++) {
    // 从顶部开始（-90度），顺时针绘制
    const angle = (Math.PI / 3) * i - Math.PI / 2;
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