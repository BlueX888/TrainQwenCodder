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
  // 使用 Graphics 绘制黄色六边形
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xFFD700, 1);
  
  // 绘制六边形（使用 beginPath 和 lineTo）
  const hexRadius = 40;
  const centerX = 50;
  const centerY = 50;
  
  graphics.beginPath();
  
  // 绘制六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度间隔
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
  
  // 生成纹理
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy();
  
  // 创建精灵对象，初始位置在左侧
  const hexSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画
  this.tweens.add({
    targets: hexSprite,        // 目标对象
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 2000,            // 持续时间 2 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 启用往返效果
    repeat: -1                 // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(400, 50, '黄色六边形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);