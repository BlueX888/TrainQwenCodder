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
  ballCount: 0,
  totalCollisions: 0,
  wallCollisions: 0,
  ballCollisions: 0,
  balls: []
};

function preload() {
  // 使用 Graphics 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932CC, 1); // 紫色
  graphics.fillCircle(16, 16, 16); // 半径16的圆
  graphics.generateTexture('purpleBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 设置世界边界
  this.physics.world.setBoundsCollision(true, true, true, true);

  // 创建物理组
  this.ballGroup = this.physics.add.group({
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 创建 12 个小球
  const ballSpeed = 120;
  const ballCount = 12;
  
  for (let i = 0; i < ballCount; i++) {
    // 随机位置（避免边界）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 创建小球
    const ball = this.ballGroup.create(x, y, 'purpleBall');
    
    // 设置弹性系数为 1（完全弹性碰撞）
    ball.setBounce(1, 1);
    
    // 设置随机速度方向，但保持速度大小为 120
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * ballSpeed;
    const velocityY = Math.sin(angle) * ballSpeed;
    
    ball.setVelocity(velocityX, velocityY);
    
    // 设置圆形碰撞体
    ball.setCircle(16);
    
    // 记录小球ID
    ball.ballId = i;
  }

  // 设置小球之间的碰撞
  this.physics.add.collider(
    this.ballGroup, 
    this.ballGroup,
    onBallCollision,
    null,
    this
  );

  // 更新初始信号
  window.__signals__.ballCount = ballCount;
  updateBallSignals(this.ballGroup);

  // 添加文本显示
  this.collisionText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 监听世界边界碰撞
  this.physics.world.on('worldbounds', () => {
    window.__signals__.wallCollisions++;
    window.__signals__.totalCollisions++;
  });
}

function update() {
  // 更新小球位置信号
  updateBallSignals(this.ballGroup);
  
  // 更新显示文本
  this.collisionText.setText([
    `Balls: ${window.__signals__.ballCount}`,
    `Total Collisions: ${window.__signals__.totalCollisions}`,
    `Wall Collisions: ${window.__signals__.wallCollisions}`,
    `Ball Collisions: ${window.__signals__.ballCollisions}`
  ]);
}

// 小球碰撞回调
function onBallCollision(ball1, ball2) {
  window.__signals__.ballCollisions++;
  window.__signals__.totalCollisions++;
  
  // 输出碰撞日志
  console.log(JSON.stringify({
    type: 'ball_collision',
    ball1: ball1.ballId,
    ball2: ball2.ballId,
    timestamp: Date.now(),
    position1: { x: Math.round(ball1.x), y: Math.round(ball1.y) },
    position2: { x: Math.round(ball2.x), y: Math.round(ball2.y) }
  }));
}

// 更新小球位置信号
function updateBallSignals(ballGroup) {
  const balls = ballGroup.getChildren();
  window.__signals__.balls = balls.map(ball => ({
    id: ball.ballId,
    x: Math.round(ball.x),
    y: Math.round(ball.y),
    vx: Math.round(ball.body.velocity.x),
    vy: Math.round(ball.body.velocity.y),
    speed: Math.round(Math.sqrt(
      ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
    ))
  }));
}

new Phaser.Game(config);