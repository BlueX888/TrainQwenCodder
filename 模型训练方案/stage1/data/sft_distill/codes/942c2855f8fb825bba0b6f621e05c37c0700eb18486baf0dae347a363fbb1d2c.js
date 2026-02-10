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
  // 使用 Graphics 绘制白色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制五角星
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 16;
  const points = 5;
  
  const starPoints = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius
    );
  }
  
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
  
  // 创建星形图像并放置在屏幕中心
  const star = this.add.image(400, 300, 'star');
  
  // 创建旋转动画
  this.tweens.add({
    targets: star,
    angle: 360,           // 旋转到 360 度
    duration: 4000,       // 持续 4 秒
    ease: 'Linear',       // 线性缓动，保持匀速旋转
    repeat: -1,           // 无限循环
    onRepeat: function() {
      // 每次循环重置角度，避免角度累积
      star.angle = 0;
    }
  });
}

new Phaser.Game(config);