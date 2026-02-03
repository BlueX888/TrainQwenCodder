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
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xFFFF00, 1);
  
  // 计算六边形的中心点（画布中央）
  const centerX = 400;
  const centerY = 300;
  const radius = 40; // 半径 40 像素，直径约 80 像素
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算并绘制六边形的六个顶点
  // 六边形的顶点角度间隔为 60 度（Math.PI / 3）
  // 从顶部开始（-90 度或 -Math.PI / 2）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - (Math.PI / 2); // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y); // 移动到第一个顶点
    } else {
      graphics.lineTo(x, y); // 连接到下一个顶点
    }
  }
  
  // 闭合路径
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);