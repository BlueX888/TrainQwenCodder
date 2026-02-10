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
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  objectCount: 0,
  collisionCount: 0,
  bounceCount: 0,
  objects: []
};

function preload() {
  // 创建黄色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillCircle(16, 16, 16); // 半径16的圆
  graphics.generateTexture('yellowBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  this.yellowGroup = this.physics.add.group({
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 创建20个黄色物体
  for (let i = 0; i < 20; i++) {
    // 随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const ball = this.yellowGroup.create(x, y, 'yellowBall');
    ball.setCircle(16); // 设置碰撞体为圆形
    
    // 设置随机方向的速度，总速度为200
    const angle = Phaser.Math.Between(0, 360);
    const velocity = this.physics.velocityFromAngle(angle, 200);
    ball.setVelocity(velocity.x, velocity.y);
    
    // 存储ID用于追踪
    ball.ballId = i;
  }

  // 设置组内物体相互碰撞
  this.physics.add.collider(this.yellowGroup, this.yellowGroup, onCollision, null, this);

  // 更新信号
  window.__signals__.objectCount = 20;
  
  // 添加文本显示碰撞信息
  this.collisionText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 监听世界边界碰撞
  this.yellowGroup.children.entries.forEach(ball => {
    ball.body.onWorldBounds = true;
  });

  this.physics.world.on('worldbounds', () => {
    window.__signals__.bounceCount++;
  });

  console.log('Game initialized:', JSON.stringify({
    objectCount: 20,
    speed: 200,
    worldBounds: { width: 800, height: 600 }
  }));
}

function update(time, delta) {
  // 更新物体位置信息到信号
  window.__signals__.objects = [];
  
  this.yellowGroup.children.entries.forEach(ball => {
    // 确保速度保持在200左右（考虑碰撞后的微小偏差）
    const currentSpeed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
    if (Math.abs(currentSpeed - 200) > 1) {
      // 归一化速度到200
      const normalizedVelocity = ball.body.velocity.normalize().scale(200);
      ball.setVelocity(normalizedVelocity.x, normalizedVelocity.y);
    }
    
    window.__signals__.objects.push({
      id: ball.ballId,
      x: Math.round(ball.x),
      y: Math.round(ball.y),
      vx: Math.round(ball.body.velocity.x),
      vy: Math.round(ball.body.velocity.y),
      speed: Math.round(currentSpeed)
    });
  });

  // 更新显示文本
  this.collisionText.setText([
    `Objects: ${window.__signals__.objectCount}`,
    `Collisions: ${window.__signals__.collisionCount}`,
    `Wall Bounces: ${window.__signals__.bounceCount}`,
    `Time: ${Math.floor(time / 1000)}s`
  ]);

  // 每5秒输出一次状态日志
  if (Math.floor(time / 1000) % 5 === 0 && Math.floor(time) % 1000 < 50) {
    console.log('Status:', JSON.stringify({
      time: Math.floor(time / 1000),
      collisions: window.__signals__.collisionCount,
      bounces: window.__signals__.bounceCount,
      sampleObject: window.__signals__.objects[0]
    }));
  }
}

function onCollision(ball1, ball2) {
  window.__signals__.collisionCount++;
  
  // 碰撞后确保速度保持在200
  [ball1, ball2].forEach(ball => {
    const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
    if (speed > 0) {
      const normalizedVelocity = ball.body.velocity.normalize().scale(200);
      ball.setVelocity(normalizedVelocity.x, normalizedVelocity.y);
    }
  });
}

new Phaser.Game(config);