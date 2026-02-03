const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 绘制一个五角星
  const points = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    points.push(x, y);
  }
  
  // 填充星形
  graphics.fillStyle(0xffff00, 1);
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵，放置在屏幕中央
  const star = this.add.sprite(400, 300, 'star');
  
  // 设置初始透明度为 0（完全透明）
  star.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: star,
    alpha: 1,              // 目标透明度为 1（完全不透明）
    duration: 1000,        // 持续时间 1 秒（1000 毫秒）
    ease: 'Linear',        // 线性缓动
    yoyo: true,            // 往返动画（从 0 到 1 再从 1 到 0）
    repeat: -1             // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);