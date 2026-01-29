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
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 60; // 六边形半径
  const centerX = hexRadius;
  const centerY = hexRadius;
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔 60 度
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    points.push({ x, y });
  }
  
  // 绘制填充的六边形
  graphics.fillStyle(0x00ff88, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  const textureSize = hexRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy();
  
  // 创建使用六边形纹理的精灵
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始 alpha 为 0（完全透明）
  hexSprite.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: hexSprite,
    alpha: 1, // 目标 alpha 值
    duration: 500, // 持续时间 0.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 来回播放（透明->不透明->透明）
    loop: -1 // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 500, '六边形淡入淡出动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);