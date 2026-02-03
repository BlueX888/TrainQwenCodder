class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 10;
    this.ballSpeed = 160;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 设置世界边界碰撞
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: this.ballCount - 1,
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 随机分布小球位置并设置随机速度
    const balls = this.balls.getChildren();
    balls.forEach((ball, index) => {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 设置圆形碰撞体
      ball.body.setCircle(16);

      // 随机方向，固定速度160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * this.ballSpeed;
      const vy = Math.sin(angle) * this.ballSpeed;
      ball.setVelocity(vx, vy);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, null, this);

    // 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示小球数量信息
    this.infoText = this.add.text(10, 40, `Balls: ${this.ballCount} | Speed: ${this.ballSpeed}`, {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  handleBallCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保小球速度保持在160左右（由于浮点运算可能有微小偏差）
    const balls = this.balls.getChildren();
    balls.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过1%，重新归一化
      if (Math.abs(currentSpeed - this.ballSpeed) > this.ballSpeed * 0.01) {
        const scale = this.ballSpeed / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

// 游戏配置
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

// 启动游戏
new Phaser.Game(config);