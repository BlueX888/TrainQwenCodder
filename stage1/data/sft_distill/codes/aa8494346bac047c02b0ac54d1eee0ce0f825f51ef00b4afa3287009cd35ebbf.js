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
  
  // 绘制星形的路径
  const points = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius + outerRadius;
    const y = Math.sin(angle) * radius + outerRadius;
    points.push({ x, y });
  }
  
  // 绘制星形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画：从左到右移动，往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 目标位置（右侧）
    duration: 1500, // 1.5 秒
    yoyo: true, // 启用往返效果
    loop: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(10, 10, '红色星形往返循环动画', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);