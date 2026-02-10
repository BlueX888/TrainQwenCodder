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
  
  // 绘制六边形（6个顶点）
  graphics.fillStyle(0x00aaff, 1);
  graphics.lineStyle(4, 0xffffff, 1);
  
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = hexCenterX + hexRadius * Math.cos(angle);
    const y = hexCenterY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 200, 200);
  graphics.destroy();
  
  // 创建六边形精灵并居中显示
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  // 使用 yoyo 实现往返效果，总时长4秒（2秒缩小 + 2秒恢复）
  this.tweens.add({
    targets: hexSprite,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 2000, // 缩小到32%需要2秒
    ease: 'Sine.easeInOut',
    yoyo: true, // 自动返回原始值
    repeat: -1 // 无限循环
  });
  
  // 添加说明文字
  this.add.text(400, 50, '六边形缩放动画循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '缩放范围: 100% ↔ 32%  |  周期: 4秒', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);