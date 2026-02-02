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
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(4, 0xffffff, 1);
  
  graphics.beginPath();
  
  // 计算六边形的六个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
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
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  // 使用 yoyo 实现从 1 -> 0.32 -> 1 的效果
  this.tweens.add({
    targets: hexagon,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 1500, // 单程 1.5 秒，往返共 3 秒
    ease: 'Sine.easeInOut',
    yoyo: true, // 启用往返效果
    loop: -1 // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 50, '六边形缩放动画 (1.0 ↔ 0.32)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '循环播放：3秒周期', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);