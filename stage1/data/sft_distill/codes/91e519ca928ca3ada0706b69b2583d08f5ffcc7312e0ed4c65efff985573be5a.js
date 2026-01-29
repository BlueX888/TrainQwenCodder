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
  // 使用 Graphics 绘制红色星形
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
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    starPoints.push(x, y);
  }
  
  graphics.fillPoints(starPoints, true);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，不再需要
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.image(100, 300, 'starTexture');
  
  // 创建补间动画：从左到右移动，往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 目标位置（屏幕右侧）
    duration: 2500, // 2.5 秒
    yoyo: true, // 往返运动
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);