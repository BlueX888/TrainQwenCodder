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
  // 使用 Graphics 绘制青色六边形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制六边形（正六边形）
  const hexRadius = 40;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const x = hexRadius * Math.cos(angle * i - Math.PI / 2);
    const y = hexRadius * Math.sin(angle * i - Math.PI / 2);
    
    if (i === 0) {
      graphics.moveTo(x + hexRadius, y + hexRadius);
    } else {
      graphics.lineTo(x + hexRadius, y + hexRadius);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建精灵对象，初始位置在左侧
  const hexSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画
  this.tweens.add({
    targets: hexSprite,
    x: 700,              // 目标位置（右侧）
    duration: 4000,      // 4秒
    yoyo: true,          // 往返效果
    loop: -1,            // 无限循环（-1 表示永久循环）
    ease: 'Linear'       // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '青色六边形左右往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);