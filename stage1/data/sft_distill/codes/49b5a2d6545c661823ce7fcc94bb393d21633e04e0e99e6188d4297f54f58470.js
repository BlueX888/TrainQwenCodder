class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.totalBalls = 12;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 使用 Graphics 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ballTexture', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ballTexture',
      repeat: this.totalBalls - 1, // 总共12个球
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个球的初始位置和速度
    const ballArray = this.balls.getChildren();
    ballArray.forEach((ball, index) => {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 设置圆形碰撞体
      ball.setCircle(16);

      // 随机方向，固定速度360
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * 360;
      const velocityY = Math.sin(angle * Math.PI / 180) * 360;
      ball.setVelocity(velocityX, velocityY);

      // 确保完全弹性碰撞
      ball.setBounce(1, 1);
    });

    // 设置球与球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 添加显示信息
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateInfo();

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
      this.updateInfo();
    });
  }

  onBallCollision(ball1, ball2) {
    // 球与球碰撞计数
    this.collisionCount++;
    this.updateInfo();
  }

  updateInfo() {
    this.infoText.setText([
      `Balls: ${this.totalBalls}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 360 px/s`
    ]);
  }

  update(time, delta) {
    // 确保速度保持在360左右（补偿浮点误差）
    const ballArray = this.balls.getChildren();
    ballArray.forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过1%，进行修正
      if (Math.abs(currentSpeed - 360) > 3.6) {
        const scale = 360 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
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