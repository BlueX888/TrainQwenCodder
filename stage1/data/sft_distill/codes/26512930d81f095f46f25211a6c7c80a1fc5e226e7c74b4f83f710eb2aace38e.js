class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 20;
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('orangeBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'orangeBall',
      repeat: this.ballCount - 1, // 创建20个小球
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 设置每个小球的随机位置和速度
    const speed = 360;
    this.balls.children.iterate((ball) => {
      // 随机位置（避免太靠近边缘）
      ball.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );

      // 随机方向的速度，保持速度大小为360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.setCircle(16);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 创建显示信息的文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新显示信息
    this.updateInfo();

    // 添加边界碰撞监听（用于统计）
    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
      this.updateInfo();
    });

    // 启用世界边界碰撞事件
    this.balls.children.iterate((ball) => {
      ball.body.onWorldBounds = true;
    });

    console.log('Game started: 20 orange balls bouncing at speed 360');
  }

  onBallCollision(ball1, ball2) {
    // 小球碰撞回调
    this.collisionCount++;
    this.updateInfo();
  }

  updateInfo() {
    // 更新显示信息
    this.infoText.setText([
      `Balls: ${this.ballCount}`,
      `Speed: 360`,
      `Collisions: ${this.collisionCount}`
    ]);
  }

  update(time, delta) {
    // 可选：保持速度恒定（防止精度损失导致速度变化）
    this.balls.children.iterate((ball) => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏离360太多，重新归一化
      if (Math.abs(currentSpeed - 360) > 1) {
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
  scene: GameScene
};

const game = new Phaser.Game(config);