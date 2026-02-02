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
  // 使用 Graphics 程序化生成星形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制白色星形
  graphics.fillStyle(0xffffff, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 绘制五角星
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 15;
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
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建星形精灵
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 移动到右侧
    duration: 2000, // 2秒完成单程
    ease: 'Linear',
    yoyo: true, // 启用往返效果
    repeat: -1 // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 50, '星形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);