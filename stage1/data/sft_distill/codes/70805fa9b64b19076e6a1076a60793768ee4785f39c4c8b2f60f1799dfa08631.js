const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制六边形
  const graphics = this.add.graphics();
  
  // 设置六边形参数
  const hexRadius = 80; // 六边形半径
  const centerX = hexRadius;
  const centerY = hexRadius;
  
  // 计算六边形的六个顶点坐标
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    hexPoints.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制填充的六边形
  graphics.fillStyle(0x00ff88, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 绘制六边形边框
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  const textureSize = hexRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy(); // 销毁 graphics 对象，因为纹理已生成
  
  // 创建六边形精灵并居中显示
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  this.tweens.add({
    targets: hexagon,
    scaleX: 0.48, // 缩放到 48%
    scaleY: 0.48,
    duration: 2500, // 2.5 秒
    yoyo: true, // 往返效果（缩小后再放大回原始大小）
    loop: -1, // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Hexagon Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scaling: 100% ↔ 48% (2.5s loop)', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);