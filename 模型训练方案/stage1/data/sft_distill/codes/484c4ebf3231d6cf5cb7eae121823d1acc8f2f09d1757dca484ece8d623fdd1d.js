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
  // 使用 Graphics 绘制青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制星形路径
  const points = [];
  const outerRadius = 40;
  const innerRadius = 20;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.image(100, 300, 'star');
  
  // 创建补间动画：从左到右移动，然后往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 移动到右侧
    duration: 2000, // 2秒
    ease: 'Linear',
    yoyo: true, // 往返效果
    repeat: -1 // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Star Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Cyan star moving left to right with yoyo loop', {
    fontSize: '16px',
    color: '#00ffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);