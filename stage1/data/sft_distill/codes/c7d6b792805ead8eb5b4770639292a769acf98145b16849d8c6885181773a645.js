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
  // 创建 Graphics 对象绘制五角星
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1); // 粉色 (HotPink)
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
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
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成纹理
  
  // 创建使用该纹理的 Sprite，放置在屏幕中央
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建旋转动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    angle: 360,              // 旋转到 360 度
    duration: 1000,          // 持续时间 1 秒
    ease: 'Linear',          // 线性缓动，保持匀速旋转
    repeat: -1,              // 无限循环 (-1 表示永久重复)
    onRepeat: function() {
      // 每次重复时重置角度，避免角度累积
      star.angle = 0;
    }
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Pink Star Rotating Animation', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);