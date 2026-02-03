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
  
  // 绘制一个黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 绘制星形的顶点坐标
  const points = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: Math.cos(angle) * radius + 60,
      y: Math.sin(angle) * radius + 60
    });
  }
  
  // 绘制星形路径
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 120, 120);
  graphics.destroy();
  
  // 创建星形精灵并居中显示
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  // 从原始大小 (scale=1) 缩放到 24% (scale=0.24)
  // 持续时间 3000 毫秒（3 秒）
  // yoyo=true 使动画反向播放，恢复到原始大小
  // loop=-1 表示无限循环
  this.tweens.add({
    targets: star,
    scaleX: 0.24,
    scaleY: 0.24,
    duration: 3000,
    yoyo: true,
    loop: -1,
    ease: 'Linear'
  });
  
  // 添加文字说明
  this.add.text(400, 50, '星形缩放动画 (3秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '缩放范围: 100% → 24% → 100%', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);