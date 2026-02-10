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
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制五角星
  const points = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: Math.cos(angle) * radius + 50,
      y: Math.sin(angle) * radius + 50
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵并居中
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  // 从原始大小(1)缩放到 16%(0.16)，然后恢复到原始大小
  // 使用 yoyo 实现往返效果，duration 为 500ms（0.5秒）
  // yoyo 会让动画反向播放，所以总时长是 0.5秒 * 2 = 1秒一个完整循环
  this.tweens.add({
    targets: star,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 500,  // 0.5 秒缩小到 16%
    yoyo: true,     // 自动反向播放（恢复到原始大小）
    loop: -1,       // 无限循环
    ease: 'Linear'  // 线性缓动
  });
}

new Phaser.Game(config);