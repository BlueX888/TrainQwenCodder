class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();

    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'blueBall',
      repeat: 19, // 创建 20 个小球（0-19）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 为每个小球设置随机位置和速度
    const ballSpeed = 240;
    this.balls.children.iterate((ball) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 随机方向的速度，总速度为 240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * ballSpeed;
      const vy = Math.sin(angle) * ballSpeed;
      ball.setVelocity(vx, vy);

      // 设置弹性
      ball.setBounce(1, 1);
      ball.setCollideWorldBounds(true);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setDepth(1);

    // 显示小球数量
    this.ballCountText = this.add.text(10, 40, 'Balls: 20', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.ballCountText.setDepth(1);

    // 绘制边界框（可视化）
    const border = this.add.graphics();
    border.lineStyle(4, 0xffffff, 1);
    border.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加计数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保所有小球速度保持在 240 左右（可选的速度修正）
    this.balls.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差过大，进行修正
      if (currentSpeed > 0 && Math.abs(currentSpeed - 240) > 10) {
        const scale = 240 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BallBounceScene
};

new Phaser.Game(config);