const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制六边形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFF8C00, 1);
  
  // 计算六边形的顶点坐标（中心点为 16,16，半径为 16）
  const hexRadius = 16;
  const centerX = 16;
  const centerY = 16;
  const hexPoints = [];
  
  // 生成六边形的6个顶点（从顶部开始，顺时针）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 绘制填充的六边形
  graphics.fillPoints(hexPoints, true);
  
  // 生成32x32的纹理
  graphics.generateTexture('hexagon', 32, 32);
  
  // 清除 graphics 对象（已生成纹理，不再需要）
  graphics.destroy();
  
  // 创建12个随机位置的六边形
  for (let i = 0; i < 12; i++) {
    // 生成随机位置（考虑六边形大小，避免超出边界）
    const randomX = Phaser.Math.Between(16, 800 - 16);
    const randomY = Phaser.Math.Between(16, 600 - 16);
    
    // 创建精灵并设置位置
    const hexSprite = this.add.sprite(randomX, randomY, 'hexagon');
  }
}

new Phaser.Game(config);