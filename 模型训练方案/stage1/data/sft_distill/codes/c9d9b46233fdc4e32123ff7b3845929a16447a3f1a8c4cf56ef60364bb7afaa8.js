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
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 40;
  const innerRadius = 16;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius + outerRadius;
    const y = Math.sin(angle) * radius + outerRadius;
    starPoints.push(x, y);
  }
  
  graphics.fillPoints(starPoints, true);
  
  // 生成纹理
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 移动到右侧
    duration: 1500, // 1.5秒
    yoyo: true, // 启用往返
    repeat: -1, // 无限循环 (-1 表示永久重复)
    ease: 'Linear' // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 50, '红色星形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);