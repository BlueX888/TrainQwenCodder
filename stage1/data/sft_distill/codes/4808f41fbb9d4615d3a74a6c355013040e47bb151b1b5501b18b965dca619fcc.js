const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制星形的坐标点
  const starPoints = [];
  const outerRadius = 40;
  const innerRadius = 20;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push({
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius
    });
  }
  
  // 绘制星形路径
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: star,
    x: 700, // 目标 x 坐标（右侧）
    duration: 2500, // 2.5 秒
    yoyo: true, // 往返效果
    loop: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加说明文字
  this.add.text(400, 50, '红色星形左右往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);