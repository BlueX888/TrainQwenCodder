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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const centerX = 50;
  const centerY = 50;
  const radius = 40;
  const sides = 6;
  
  // 计算六边形的顶点
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
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
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy();
  
  // 创建精灵对象
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始透明度为 0
  hexagon.setAlpha(0);
  
  // 创建循环渐变动画
  this.tweens.add({
    targets: hexagon,
    alpha: 1,              // 目标透明度为 1（完全不透明）
    duration: 500,         // 持续时间 0.5 秒
    yoyo: true,            // 来回播放（1 -> 0 -> 1）
    repeat: -1,            // 无限循环
    ease: 'Linear'         // 线性缓动
  });
}

new Phaser.Game(config);