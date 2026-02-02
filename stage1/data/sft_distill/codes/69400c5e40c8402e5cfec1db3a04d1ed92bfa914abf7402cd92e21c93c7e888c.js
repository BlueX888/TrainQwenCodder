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

let diamond;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制菱形（四个点组成）
  const size = 30;
  graphics.beginPath();
  graphics.moveTo(size, 0);      // 上顶点
  graphics.lineTo(size * 2, size); // 右顶点
  graphics.lineTo(size, size * 2); // 下顶点
  graphics.lineTo(0, size);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建物理精灵
  diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置初始速度（随机方向，速度为 80）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 80);
  diamond.setVelocity(velocity.x, velocity.y);
  
  // 设置精灵与世界边界碰撞
  diamond.setCollideWorldBounds(true);
  diamond.setBounce(1, 1); // 完全弹性碰撞
  
  // 设置世界边界
  this.physics.world.setBoundsCollision(true, true, true, true);
}

function update(time, delta) {
  // 物理系统自动处理边界反弹，无需额外逻辑
  
  // 可选：确保速度保持恒定（防止浮点误差累积）
  const currentSpeed = Math.sqrt(
    diamond.body.velocity.x ** 2 + 
    diamond.body.velocity.y ** 2
  );
  
  if (Math.abs(currentSpeed - 80) > 0.1) {
    const normalizedVelocity = diamond.body.velocity.normalize();
    diamond.setVelocity(
      normalizedVelocity.x * 80,
      normalizedVelocity.y * 80
    );
  }
}

new Phaser.Game(config);