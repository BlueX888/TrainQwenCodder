class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 状态信号：碰撞次数
    this.activeBalls = 0; // 状态信号：活跃小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.ballGroup = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建5个小球
    const ballCount = 5;
    const speed = 80;

    for (let i = 0; i < ballCount; i++) {
      // 随机位置（避免边界太近）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);

      // 创建小球
      const ball = this.ballGroup.create(x, y, 'ball');
      
      // 设置随机速度方向
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      ball.setVelocity(velocityX, velocityY);
      
      // 设置圆形碰撞体（更精确的碰撞）
      ball.body.setCircle(16);
    }

    this.activeBalls = ballCount;

    // 添加小球之间的碰撞检测
    this.physics.add.collider(
      this.ballGroup,
      this.ballGroup,
      this.handleBallCollision,
      null,
      this
    );

    // 显示状态信息
    this.collisionText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  handleBallCollision(ball1, ball2) {
    // 增加碰撞计数
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.collisionText.setText([
      `Active Balls: ${this.activeBalls}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 80 px/s`
    ]);
  }

  update(time, delta) {
    // 验证小球速度保持在目标速度附近（由于弹性碰撞可能有微小变化）
    this.ballGroup.children.entries.forEach(ball => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差过大，重新标准化到80
      if (Math.abs(currentSpeed - 80) > 5) {
        const angle = Math.atan2(ball.body.velocity.y, ball.body.velocity.x);
        ball.setVelocity(
          Math.cos(angle) * 80,
          Math.sin(angle) * 80
        );
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
  scene: BallBounceScene
};

new Phaser.Game(config);