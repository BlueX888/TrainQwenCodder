class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0;
    this.ballCount = 20;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('redBall', 32, 32);
    graphics.destroy();

    // 创建小球组
    this.balls = this.physics.add.group({
      key: 'redBall',
      repeat: this.ballCount - 1,
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的随机位置和速度
    const ballsArray = this.balls.getChildren();
    ballsArray.forEach((ball, index) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 随机方向，固定速度 80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * 80;
      const vy = Math.sin(angle) * 80;
      ball.setVelocity(vx, vy);

      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 添加边界碰撞监听
    ballsArray.forEach(ball => {
      ball.body.onWorldBounds = true;
    });

    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
      this.updateSignals();
    });

    // 初始化信号输出
    this.updateSignals();

    // 添加文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界可视化
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    this.collisionCount++;
    this.updateSignals();
  }

  updateSignals() {
    // 输出可验证的状态信号
    window.__signals__ = {
      ballCount: this.ballCount,
      collisionCount: this.collisionCount,
      activeBalls: this.balls ? this.balls.getChildren().length : 0,
      timestamp: Date.now()
    };

    // 更新显示文本
    if (this.collisionText) {
      this.collisionText.setText(
        `Balls: ${this.ballCount}\nCollisions: ${this.collisionCount}`
      );
    }

    // 输出日志 JSON
    console.log(JSON.stringify(window.__signals__));
  }

  update(time, delta) {
    // 确保所有小球保持恒定速度
    const ballsArray = this.balls.getChildren();
    ballsArray.forEach(ball => {
      const velocity = ball.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏离 80 太多，重新归一化
      if (Math.abs(speed - 80) > 1) {
        const scale = 80 / speed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BallCollisionScene
};

const game = new Phaser.Game(config);