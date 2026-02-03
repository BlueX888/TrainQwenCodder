class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 10;
    this.ballSpeed = 360;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径 16 的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: this.ballCount - 1, // 总共创建 10 个
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 设置每个小球的随机位置和速度
    this.balls.children.iterate((ball) => {
      // 随机位置（避免太靠近边缘）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 随机方向，固定速度 360
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * this.ballSpeed;
      const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * this.ballSpeed;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.setCircle(16);
    });

    // 小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 添加碰撞计数显示
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界显示
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(0, 0, width, height);

    // 添加说明文字
    this.add.text(width / 2, height - 20, 'Orange balls bouncing with elastic collision', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞计数器递增
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 可选：添加碰撞视觉反馈
    ball1.setTint(0xffff00);
    ball2.setTint(0xffff00);

    this.time.delayedCall(100, () => {
      ball1.clearTint();
      ball2.clearTint();
    });
  }

  update(time, delta) {
    // 确保速度保持恒定（修正浮点误差）
    this.balls.children.iterate((ball) => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );

      if (Math.abs(currentSpeed - this.ballSpeed) > 1) {
        const scale = this.ballSpeed / currentSpeed;
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

const game = new Phaser.Game(config);