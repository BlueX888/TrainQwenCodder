const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 方法1: 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制星形路径（5个角的星形）
  const centerX = 400;
  const centerY = 300;
  const outerRadius = 80;
  const innerRadius = 40;
  const points = 5;
  
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 创建旋转补间动画
  // 注意：Graphics 对象的旋转中心默认在 (0, 0)，需要调整
  this.tweens.add({
    targets: graphics,
    angle: 360,           // 旋转到 360 度
    duration: 4000,       // 持续时间 4 秒
    repeat: -1,           // 无限循环
    ease: 'Linear'        // 线性缓动，保持匀速旋转
  });
  
  // 方法2（备选）：使用 Star 几何体
  // 如果需要更简洁的方式，可以使用内置的 Star 对象
  /*
  const star = this.add.star(400, 300, 5, 40, 80, 0xffffff);
  
  this.tweens.add({
    targets: star,
    angle: 360,
    duration: 4000,
    repeat: -1,
    ease: 'Linear'
  });
  */
}

new Phaser.Game(config);