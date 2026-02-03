class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.balls = [];
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建3个小球
    const speed = 240;
    const positions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 400 }
    ];

    for (let i = 0; i < 3; i++) {
      const ball = this.physics.add.sprite(
        positions[i].x,
        positions[i].y,
        'ball'
      );

      // 设置完全弹性碰撞
      ball.setBounce(1, 1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机方向的速度，总速度为240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);
      
      // 关闭阻力，保持恒定速度
      ball.body.setDrag(0);
      ball.body.setMaxVelocity(speed, speed);
      
      this.balls.push(ball);
    }

    // 添加球与球之间的碰撞检测
    this.physics.add.collider(this.balls[0], this.balls[1], this.onBallCollision, null, this);
    this.physics.add.collider(this.balls[0], this.balls[2], this.onBallCollision, null, this);
    this.physics.add.collider(this.balls[1], this.balls[2], this.onBallCollision, null, this);

    // 显示碰撞计数器
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示说明文字
    this.add.text(10, 40, 'Green balls bouncing with elastic collision', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加边界碰撞监听
    this.balls.forEach((ball, index) => {
      ball.body.onWorldBounds = true;
    });

    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
      this.updateCollisionText();
    });
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调
    this.collisionCount++;
    this.updateCollisionText();
    
    // 确保速度保持在240左右（修正浮点误差）
    const speed = 240;
    [ball1, ball2].forEach(ball => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      if (Math.abs(currentSpeed - speed) > 1) {
        const scale = speed / currentSpeed;
        ball.setVelocity(
          ball.body.velocity.x * scale,
          ball.body.velocity.y * scale
        );
      }
    });
  }

  updateCollisionText() {
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保球体速度保持恒定（修正物理引擎的微小误差）
    const targetSpeed = 240;
    this.balls.forEach(ball => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差超过阈值，进行修正
      if (Math.abs(currentSpeed - targetSpeed) > 5) {
        const scale = targetSpeed / currentSpeed;
        ball.setVelocity(
          ball.body.velocity.x * scale,
          ball.body.velocity.y * scale
        );
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BallBounceScene
};

new Phaser.Game(config);