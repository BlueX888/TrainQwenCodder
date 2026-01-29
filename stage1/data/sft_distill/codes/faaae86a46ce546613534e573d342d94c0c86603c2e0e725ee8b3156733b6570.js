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
    const angle = (Math.PI / 3) * i;
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
  this.tweens.add({
    targets: hexagon,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 3000,
    ease: 'Sine.easeInOut',
    yoyo: true,  // 自动反向播放（恢复到原始大小）
    loop: -1,    // 无限循环
    repeat: 0    // yoyo 模式下不需要额外 repeat
  });
  
  // 添加提示文本
  this.add.text(400, 50, '六边形缩放动画（循环播放）', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '缩放范围: 100% ↔ 32%，周期: 6秒', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);