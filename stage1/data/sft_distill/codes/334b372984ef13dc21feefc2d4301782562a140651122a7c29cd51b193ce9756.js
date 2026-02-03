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
  
  // 绘制六边形
  graphics.fillStyle(0x00ff88, 1);
  graphics.lineStyle(4, 0xffffff, 1);
  
  graphics.beginPath();
  
  // 计算六边形的 6 个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角度 60 度
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
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
  const textureSize = hexRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy();
  
  // 创建六边形 Sprite
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画 Tween
  this.tweens.add({
    targets: hexagon,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 2500, // 2.5 秒
    yoyo: true, // 自动反向播放（恢复到原始大小）
    loop: -1, // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加文字说明
  this.add.text(400, 500, '六边形缩放动画 (循环播放)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);