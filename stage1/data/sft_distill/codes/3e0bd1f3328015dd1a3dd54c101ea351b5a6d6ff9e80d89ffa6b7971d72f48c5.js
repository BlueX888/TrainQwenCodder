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
  // 使用 Graphics 绘制红色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  
  // 绘制五角星
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 16;
  const points = 5;
  
  // 计算星形顶点坐标
  const starPoints = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    starPoints.push(x, y);
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
  graphics.generateTexture('redStar', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.image(100, 300, 'redStar');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: star,
    x: 700, // 目标位置（右侧）
    duration: 2500, // 2.5秒
    yoyo: true, // 启用往返效果
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);