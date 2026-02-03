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
  // 使用 Graphics 绘制青色星形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制星形（5个尖角）
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 20;
  const points = 5;
  
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 移动到右侧
    duration: 2000, // 2秒
    yoyo: true, // 往返效果
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加说明文字
  this.add.text(400, 50, '青色星形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);