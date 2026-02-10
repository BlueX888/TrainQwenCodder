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
  
  // 绘制五角星
  const starPoints = [];
  const numPoints = 5;
  const outerRadius = 40;
  const innerRadius = 16;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push(
      radius * Math.cos(angle),
      radius * Math.sin(angle)
    );
  }
  
  // 设置填充颜色为灰色
  graphics.fillStyle(0x808080, 1);
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 80, 80);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 移动到右侧
    duration: 1000, // 1秒
    yoyo: true, // 往返
    loop: -1, // 无限循环
    ease: 'Linear' // 线性运动
  });
}

new Phaser.Game(config);