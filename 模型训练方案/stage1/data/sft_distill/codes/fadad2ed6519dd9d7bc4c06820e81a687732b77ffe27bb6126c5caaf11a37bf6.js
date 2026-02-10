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
  const hexRadius = 80;
  const hexCenterX = 100;
  const hexCenterY = 100;
  
  // 绘制六边形
  graphics.fillStyle(0x00aaff, 1);
  graphics.lineStyle(4, 0xffffff, 1);
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始，每60度一个顶点
    const x = hexCenterX + hexRadius * Math.cos(angle);
    const y = hexCenterY + hexRadius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制多边形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 200, 200);
  graphics.destroy(); // 销毁 Graphics 对象，只保留纹理
  
  // 创建使用六边形纹理的 Sprite
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: hexSprite,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 1000, // 缩小阶段 1 秒
    yoyo: true,     // 自动反向播放（恢复到原始大小）
    repeat: -1,     // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加说明文字
  this.add.text(400, 500, '六边形缩放动画（2秒循环）', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);