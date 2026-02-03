class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 10;
    this.ballSpeed = 360;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('greenBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建 10 个小球
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免边缘）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.balls.create(x, y, 'greenBall');
      ball.setCircle(16); // 设置圆形碰撞体
      
      // 生成随机角度，速度恒定为 360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * this.ballSpeed;
      const velocityY = Math.sin(angle) * this.ballSpeed;
      
      ball.setVelocity(velocityX, velocityY);
    }

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数器
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示小球数量
    this.ballCountText = this.add.text(10, 50, `Balls: ${this.ballCount}`, {
      fontSize: '20px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示速度信息
    this.speedText = this.add.text(10, 90, `Speed: ${this.ballSpeed}`, {
      fontSize: '20px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界提示
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 0.5);
    border.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加计数器
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保小球速度保持恒定（可选，防止浮点误差累积）
    this.balls.children.entries.forEach(ball => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差超过 5%，进行修正
      if (Math.abs(currentSpeed - this.ballSpeed) > this.ballSpeed * 0.05) {
        const scale = this.ballSpeed / currentSpeed;
        ball.body.velocity.x *= scale;
        ball.body.velocity.y *= scale;
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BallCollisionScene
};

new Phaser.Game(config);