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
  const hexRadius = 60;
  const centerX = hexRadius;
  const centerY = hexRadius;
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度间隔
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    points.push({ x, y });
  }
  
  // 绘制六边形
  graphics.fillStyle(0x00ff88, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵并居中显示
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  // 从原始大小(1) -> 缩放到32%(0.32) -> 恢复到原始大小(1)
  this.tweens.add({
    targets: hexSprite,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 1000, // 1秒缩小到32%
    yoyo: true,     // 自动反向播放（恢复到原始大小）
    repeat: -1,     // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 50, '六边形缩放动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '1秒缩放到32%，然后恢复，循环播放', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);