class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.activeBalls = 0; // 状态信号：活跃小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const BALL_COUNT = 15;
    const BALL_RADIUS = 15;
    const BALL_SPEED = 360;
    const BALL_COLOR = 0xFF8C00; // 橙色

    // 程序化生成橙色小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(BALL_COLOR, 1);
    graphics.fillCircle(BALL_RADIUS, BALL_RADIUS, BALL_RADIUS);
    graphics.generateTexture('orangeBall', BALL_RADIUS * 2, BALL_RADIUS * 2);
    graphics.destroy();

    // 设置世界边界碰撞
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'orangeBall',
      frameQuantity: BALL_COUNT,
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的初始位置和速度
    const balls = this.balls.getChildren();
    balls.forEach((ball, index) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 设置圆形碰撞体
      ball.body.setCircle(BALL_RADIUS);

      // 随机方向的速度，保持总速度为 360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * BALL_SPEED;
      const vy = Math.sin(angle) * BALL_SPEED;
      ball.setVelocity(vx, vy);

      // 确保完全弹性碰撞
      ball.setBounce(1, 1);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 更新活跃小球数量
    this.activeBalls = BALL_COUNT;

    // 添加调试文本显示状态
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 570, '橙色小球弹性碰撞演示 - 15个小球以360速度运动', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  onBallCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新调试信息
    const avgSpeed = this.calculateAverageSpeed();
    this.debugText.setText([
      `活跃小球: ${this.activeBalls}`,
      `碰撞次数: ${this.collisionCount}`,
      `平均速度: ${avgSpeed.toFixed(2)}`
    ]);

    // 确保小球速度保持在360左右（由于浮点误差可能会有微小变化）
    const balls = this.balls.getChildren();
    balls.forEach(ball => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      // 如果速度偏差过大，重新归一化
      if (Math.abs(speed - 360) > 10) {
        const scale = 360 / speed;
        ball.setVelocity(ball.body.velocity.x * scale, ball.body.velocity.y * scale);
      }
    });
  }

  calculateAverageSpeed() {
    const balls = this.balls.getChildren();
    let totalSpeed = 0;
    balls.forEach(ball => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      totalSpeed += speed;
    });
    return balls.length > 0 ? totalSpeed / balls.length : 0;
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