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
  const centerX = 100;
  const centerY = 100;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff88, 1);
  graphics.lineStyle(4, 0xffffff, 1);
  
  graphics.beginPath();
  
  // 计算六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始
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
  graphics.generateTexture('hexagon', 200, 200);
  graphics.destroy();
  
  // 创建六边形精灵并居中显示
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  // yoyo: true 表示动画会反向播放（缩小后再放大）
  // duration: 2500 表示单程2.5秒，完整循环5秒
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: hexagon,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 2500,
    yoyo: true,
    loop: -1,
    ease: 'Sine.easeInOut'
  });
  
  // 添加文字说明
  this.add.text(400, 50, '六边形缩放动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '循环播放：1.0 → 0.48 → 1.0', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);