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
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 40;
  const innerRadius = 16;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push({
      x: Math.cos(angle) * radius + 50,
      y: Math.sin(angle) * radius + 50
    });
  }
  
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
  
  // 创建星形图像对象，初始位置在左侧
  const star = this.add.image(100, 300, 'star');
  
  // 创建补间动画：从左移动到右，然后往返循环
  this.tweens.add({
    targets: star,
    x: 700,                // 目标 x 坐标（右侧）
    duration: 2500,        // 持续时间 2.5 秒
    yoyo: true,            // 启用往返效果（到达终点后反向播放）
    repeat: -1,            // 无限循环（-1 表示永久重复）
    ease: 'Linear'         // 线性缓动，匀速运动
  });
}

new Phaser.Game(config);