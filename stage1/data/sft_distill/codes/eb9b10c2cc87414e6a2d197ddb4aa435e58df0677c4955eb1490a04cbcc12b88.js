const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色星形
  const graphics = this.add.graphics();
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    starPoints.push(x, y);
  }
  
  // 填充白色星形
  graphics.fillStyle(0xffffff, 1);
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
  
  // 在场景中心创建星形图像
  const star = this.add.image(400, 300, 'star');
  
  // 创建旋转动画
  this.tweens.add({
    targets: star,
    rotation: Math.PI * 2, // 旋转 360 度（2π 弧度）
    duration: 4000, // 4 秒完成一次旋转
    ease: 'Linear', // 线性缓动，保持匀速旋转
    repeat: -1 // 无限循环
  });
}

new Phaser.Game(config);