class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 状态信号：碰撞次数
    this.ballCount = 10; // 状态信号：小球数量
  }

  preload() {
    // 使用 Graphics 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('whiteBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      key: 'whiteBall',
      repeat: this.ballCount - 1, // 创建10个小球
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的随机位置和速度
    const ballSpeed = 160;
    this.balls.children.entries.forEach((ball, index) => {
      // 随机位置（避免边缘）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 随机方向的速度，保持速度大小为160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * ballSpeed;
      const vy = Math.sin(angle) * ballSpeed;
      ball.setVelocity(vx, vy);

      // 确保完全弹性碰撞
      ball.body.setBounce(1, 1);
      ball.body.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体（更精确）
      ball.setCircle(16);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调：记录碰撞次数
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 160 px/s`
    ]);
  }

  update(time, delta) {
    // 确保速度保持恒定（可选，补偿物理引擎的微小误差）
    this.balls.children.entries.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差较大，重新归一化
      if (Math.abs(currentSpeed - 160) > 5) {
        const scale = 160 / currentSpeed;
        ball.body.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BallCollisionScene
};

new Phaser.Game(config);