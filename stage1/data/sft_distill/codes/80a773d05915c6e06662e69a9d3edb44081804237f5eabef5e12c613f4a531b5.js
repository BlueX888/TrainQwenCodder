const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制六边形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFF8C00, 1);
  
  // 六边形参数
  const hexRadius = 16; // 半径16像素，总大小32像素
  const centerX = hexRadius;
  const centerY = hexRadius;
  
  // 计算六边形的6个顶点坐标
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制填充的六边形
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  
  // 销毁 Graphics 对象以释放资源
  graphics.destroy();
  
  // 创建12个随机位置的六边形
  for (let i = 0; i < 12; i++) {
    // 生成随机位置（确保六边形完全在画布内）
    const randomX = Phaser.Math.Between(hexRadius, config.width - hexRadius);
    const randomY = Phaser.Math.Between(hexRadius, config.height - hexRadius);
    
    // 创建六边形精灵
    const hexagon = this.add.image(randomX, randomY, 'hexagon');
  }
}

new Phaser.Game(config);