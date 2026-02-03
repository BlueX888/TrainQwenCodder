class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 20;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 创建紫色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9966ff, 1); // 紫色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 设置世界边界
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: this.ballCount - 1,
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true
    });

    // 为每个小球设置随机位置和速度
    this.balls.children.iterate((ball) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 随机方向，固定速度300
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 300;
      const velocityY = Math.sin(angle) * 300;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界提示
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 0.5);
    border.strokeRect(0, 0, width, height);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞计数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态信息
    this.infoText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 300 px/s`
    ]);

    // 确保速度保持在300左右（防止浮点误差累积）
    this.balls.children.iterate((ball) => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过5%，重新归一化
      if (Math.abs(currentSpeed - 300) > 15) {
        const scale = 300 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BallCollisionScene
};

// 创建游戏实例
const game = new Phaser.Game(config);