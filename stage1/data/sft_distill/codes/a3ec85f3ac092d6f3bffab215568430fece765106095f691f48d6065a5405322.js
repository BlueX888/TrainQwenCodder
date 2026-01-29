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
  },
  backgroundColor: '#2d2d2d'
};

let star;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制五角星（中心点在 50, 50，外半径 40，内半径 20）
  graphics.fillStar(50, 50, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  graphics.destroy();
  
  // 创建物理精灵
  star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置速度（随机方向，速度为240）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 240;
  const velocityY = Math.sin(angle * Math.PI / 180) * 240;
  star.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 禁用摩擦力，保持速度恒定
  star.setDamping(false);
}

function update(time, delta) {
  // 确保速度保持在240
  const currentSpeed = Math.sqrt(
    star.body.velocity.x * star.body.velocity.x + 
    star.body.velocity.y * star.body.velocity.y
  );
  
  if (currentSpeed !== 0 && Math.abs(currentSpeed - 240) > 0.1) {
    // 归一化速度向量并乘以240
    const normalizedX = star.body.velocity.x / currentSpeed;
    const normalizedY = star.body.velocity.y / currentSpeed;
    star.setVelocity(normalizedX * 240, normalizedY * 240);
  }
}

new Phaser.Game(config);