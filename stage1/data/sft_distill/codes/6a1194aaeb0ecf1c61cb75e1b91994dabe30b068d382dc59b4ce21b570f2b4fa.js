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
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push({
      x: 60 + Math.cos(angle) * radius,
      y: 60 + Math.sin(angle) * radius
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
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 120, 120);
  graphics.destroy();
  
  // 创建星形精灵并居中
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  // 从原始大小(scale=1)缩放到16%(scale=0.16)，持续0.5秒
  // yoyo=true 使动画反向播放（恢复到原始大小）
  // loop=-1 实现无限循环
  this.tweens.add({
    targets: star,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 500, // 0.5秒
    ease: 'Linear',
    yoyo: true, // 动画结束后反向播放，实现恢复效果
    loop: -1 // 无限循环
  });
}

new Phaser.Game(config);