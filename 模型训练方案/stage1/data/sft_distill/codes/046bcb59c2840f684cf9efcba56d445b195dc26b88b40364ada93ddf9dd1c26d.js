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
    preload,
    create,
    update
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  
  // 绘制星形（5个点，外半径30，内半径15）
  const points = 5;
  const outerRadius = 30;
  const innerRadius = 15;
  const centerX = 32;
  const centerY = 32;
  
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
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
  
  // 设置速度（随机方向，速度为160）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 160);
  this.star.setVelocity(velocity.x, velocity.y);
  
  // 设置与世界边界碰撞
  this.star.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  this.star.setBounce(1, 1);
}

function update(time, delta) {
  // 不需要额外的更新逻辑，物理系统会自动处理移动和反弹
}

new Phaser.Game(config);