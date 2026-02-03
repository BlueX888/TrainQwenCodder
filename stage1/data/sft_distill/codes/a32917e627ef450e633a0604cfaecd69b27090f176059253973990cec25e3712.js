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
  
  // 六边形参数
  const hexRadius = 80;
  const centerX = hexRadius + 10;
  const centerY = hexRadius + 10;
  
  // 绘制六边形
  graphics.fillStyle(0x4a90e2, 1);
  graphics.lineStyle(4, 0xffffff, 1);
  
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
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
  const textureSize = (hexRadius + 10) * 2;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy();
  
  // 创建六边形精灵并居中显示
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  // 使用 yoyo 模式实现缩放到 0.8 后恢复到 1
  this.tweens.add({
    targets: hexagon,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 750, // 1.5秒的一半，因为 yoyo 会来回
    ease: 'Sine.easeInOut',
    yoyo: true, // 自动反向播放
    loop: -1 // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Hexagon scaling animation (1.0 → 0.8 → 1.0)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);