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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制六边形（正六边形）
  const hexRadius = 80;
  const centerX = 100;
  const centerY = 100;
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    points.push(x, y);
  }
  
  // 绘制多边形
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 200, 200);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建使用六边形纹理的精灵
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始透明度为 0
  hexSprite.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，3 秒内完成，循环播放
  this.tweens.add({
    targets: hexSprite,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 3000, // 持续 3 秒（3000 毫秒）
    ease: 'Linear', // 线性缓动
    yoyo: true, // 来回播放（从 0 到 1，再从 1 到 0）
    repeat: -1 // 无限循环
  });
}

// 创建游戏实例
new Phaser.Game(config);