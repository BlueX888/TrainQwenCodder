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

// 状态信号变量
let collisionCount = 0;
let ballsGroup;
let collisionText;

function preload() {
  // 使用 Graphics 创建橙色小球纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.fillCircle(16, 16, 16); // 半径16的圆
  graphics.generateTexture('ball', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理组
  ballsGroup = this.physics.add.group({
    bounceX: 1,
    bounceY: 1,
    collideWorldBounds: true
  });

  // 创建15个小球
  for (let i = 0; i < 15; i++) {
    // 随机位置（避免靠近边界）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const ball = ballsGroup.create(x, y, 'ball');
    
    // 设置随机速度方向，速度大小为120
    const angle = Phaser.Math.Between(0, 360);
    const velocityX = Math.cos(angle * Math.PI / 180) * 120;
    const velocityY = Math.sin(angle * Math.PI / 180) * 120;
    
    ball.setVelocity(velocityX, velocityY);
    ball.setBounce(1, 1); // 完全弹性碰撞
    ball.setCollideWorldBounds(true);
    ball.setCircle(16); // 设置圆形碰撞体
  }

  // 设置小球之间的碰撞
  this.physics.add.collider(ballsGroup, ballsGroup, onBallCollision, null, this);

  // 显示碰撞计数文本
  collisionText = this.add.text(16, 16, 'Collisions: 0', {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  collisionText.setDepth(1);

  // 添加边界提示
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(4, 0xffffff, 0.5);
  borderGraphics.strokeRect(2, 2, 796, 596);

  // 添加说明文本
  this.add.text(400, 580, 'Orange balls bouncing with elastic collision', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 }
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 确保所有小球速度保持在120左右（补偿浮点误差）
  ballsGroup.children.entries.forEach(ball => {
    const currentSpeed = Math.sqrt(
      ball.body.velocity.x ** 2 + 
      ball.body.velocity.y ** 2
    );
    
    // 如果速度偏差较大，重新归一化到120
    if (Math.abs(currentSpeed - 120) > 1) {
      const scale = 120 / currentSpeed;
      ball.body.velocity.x *= scale;
      ball.body.velocity.y *= scale;
    }
  });
}

function onBallCollision(ball1, ball2) {
  // 记录碰撞次数
  collisionCount++;
  collisionText.setText('Collisions: ' + collisionCount);
  
  // 可选：添加碰撞视觉反馈
  ball1.setTint(0xFFFF00);
  ball2.setTint(0xFFFF00);
  
  // 0.1秒后恢复颜色
  setTimeout(() => {
    ball1.clearTint();
    ball2.clearTint();
  }, 100);
}

const game = new Phaser.Game(config);