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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色星形
  const graphics = this.add.graphics();
  
  // 设置蓝色填充
  graphics.fillStyle(0x4169E1, 1);
  
  // 绘制星形（5个角）
  const starPoints = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const x = 60 + Math.cos(angle) * radius;
    const y = 60 + Math.sin(angle) * radius;
    starPoints.push(x, y);
  }
  
  graphics.fillPoints(starPoints, true);
  
  // 生成纹理
  graphics.generateTexture('blueStar', 120, 120);
  
  // 清除 graphics 对象（已生成纹理，不再需要）
  graphics.destroy();
  
  // 创建使用星形纹理的 Sprite
  const star = this.add.sprite(400, 300, 'blueStar');
  
  // 创建旋转补间动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    angle: 360,              // 旋转到360度（完整一圈）
    duration: 2000,          // 持续时间2秒（2000毫秒）
    ease: 'Linear',          // 线性缓动，保持匀速旋转
    repeat: -1,              // 无限循环（-1表示永久重复）
    onRepeat: function() {
      // 每次重复时重置角度，避免累积
      star.angle = 0;
    }
  });
}

new Phaser.Game(config);