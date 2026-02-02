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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制六边形
  const hexagonRadius = 80;
  const centerX = 100;
  const centerY = 100;
  const sides = 6;
  
  // 计算六边形的顶点
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    const x = centerX + Math.cos(angle) * hexagonRadius;
    const y = centerY + Math.sin(angle) * hexagonRadius;
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
  graphics.destroy();
  
  // 创建 Sprite 并设置位置到屏幕中心
  const hexagonSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 初始设置为完全透明
  hexagonSprite.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: hexagonSprite,
    alpha: 1,              // 目标透明度为 1（完全不透明）
    duration: 1000,        // 持续时间 1 秒
    ease: 'Linear',        // 线性缓动
    yoyo: true,            // 反向播放（从 1 回到 0）
    repeat: -1             // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(400, 500, '六边形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);