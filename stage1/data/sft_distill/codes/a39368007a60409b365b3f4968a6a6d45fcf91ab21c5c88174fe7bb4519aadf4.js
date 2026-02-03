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
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 画布中心点
  const centerX = 400;
  const centerY = 300;
  
  // 六边形半径（从中心到顶点的距离）
  const radius = 40;
  
  // 绘制六边形
  graphics.beginPath();
  
  // 计算六个顶点并绘制
  // 六边形的第一个顶点从正上方开始（-90度），然后每隔60度一个顶点
  for (let i = 0; i < 6; i++) {
    // 角度：从 -90度开始，每次增加 60度
    const angle = (Math.PI / 180) * (-90 + i * 60);
    
    // 计算顶点坐标
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      // 第一个顶点，移动到该位置
      graphics.moveTo(x, y);
    } else {
      // 其他顶点，画线连接
      graphics.lineTo(x, y);
    }
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);