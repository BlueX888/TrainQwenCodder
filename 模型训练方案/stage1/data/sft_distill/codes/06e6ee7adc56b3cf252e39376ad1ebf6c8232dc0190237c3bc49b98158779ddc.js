const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制星形路径
  const points = 5; // 五角星
  const outerRadius = 30;
  const innerRadius = 15;
  const centerX = 32;
  const centerY = 32;
  
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
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  this.star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置初始速度（随机方向，速度为120）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 120;
  const velocityY = Math.sin(angle) * 120;
  this.star.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  this.star.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  this.star.setBounce(1, 1);
}

function update(time, delta) {
  // 保持速度恒定为120
  const currentVelocity = this.star.body.velocity;
  const speed = Math.sqrt(currentVelocity.x ** 2 + currentVelocity.y ** 2);
  
  if (speed > 0 && Math.abs(speed - 120) > 0.1) {
    const scale = 120 / speed;
    this.star.setVelocity(currentVelocity.x * scale, currentVelocity.y * scale);
  }
}

new Phaser.Game(config);