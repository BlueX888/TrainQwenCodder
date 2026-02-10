const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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

// 可验证的状态信号
let collisionCount = 0;
let ballCount = 5;
let ballSpeed = 360;
let statusText;

function preload() {
  // 使用 Graphics 创建绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('greenBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 800, 600);

  // 创建物理组
  const balls = this.physics.add.group({
    key: 'greenBall',
    repeat: ballCount - 1,
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 为每个小球设置随机位置和随机方向的 360 速度
  balls.children.entries.forEach((ball, index) => {
    // 随机位置（避免太靠近边界）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    ball.setPosition(x, y);

    // 随机角度，速度为 360
    const angle = Phaser.Math.Between(0, 360);
    const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * ballSpeed;
    const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * ballSpeed;
    ball.setVelocity(velocityX, velocityY);

    // 设置圆形碰撞体
    ball.setCircle(16);
  });

  // 添加小球之间的碰撞检测
  this.physics.add.collider(balls, balls, onBallCollision, null, this);

  // 显示状态信息
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
}

function update(time, delta) {
  // 更新状态显示
  updateStatusText();
}

// 小球碰撞回调函数
function onBallCollision(ball1, ball2) {
  collisionCount++;
}

// 更新状态文本
function updateStatusText() {
  if (statusText) {
    statusText.setText([
      `Ball Count: ${ballCount}`,
      `Ball Speed: ${ballSpeed}`,
      `Collisions: ${collisionCount}`,
      `Status: Running`
    ]);
  }
}

new Phaser.Game(config);