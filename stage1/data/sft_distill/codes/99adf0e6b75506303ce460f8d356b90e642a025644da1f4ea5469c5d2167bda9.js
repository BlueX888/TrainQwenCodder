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
  // 使用 Graphics 绘制灰色星形
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 40;
  const innerRadius = 16;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    starPoints.push(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
  }
  
  // 绘制星形路径
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画：从左移动到右，往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 目标位置（右侧）
    duration: 2000, // 持续时间 2 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果
    repeat: -1 // 无限循环
  });
}

new Phaser.Game(config);