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
  // 创建橙色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  
  // 绘制星形的路径
  const starPoints = [];
  const outerRadius = 40;
  const innerRadius = 20;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
  }
  
  // 绘制星形
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 移动到右侧
    duration: 2500, // 2.5秒
    ease: 'Linear',
    yoyo: true, // 往返效果
    repeat: -1 // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Orange Star Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Moving left to right and back (2.5s each way)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);