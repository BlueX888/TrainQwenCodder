class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 程序化生成白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ballTexture', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ballTexture',
      repeat: 4, // 总共5个小球
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 为每个小球设置随机位置和速度
    const speed = 360;
    this.balls.children.entries.forEach((ball, index) => {
      // 设置随机位置（避免重叠）
      const x = Phaser.Math.Between(100, width - 100);
      const y = Phaser.Math.Between(100, height - 100);
      ball.setPosition(x, y);

      // 设置随机方向的速度，速度大小为360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, null, this);

    // 显示碰撞计数器（用于验证状态）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setScrollFactor(0);
    this.collisionText.setDepth(100);

    // 添加速度显示（辅助验证）
    this.speedText = this.add.text(10, 50, 'Speed: 360', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.speedText.setScrollFactor(0);
    this.speedText.setDepth(100);
  }

  handleBallCollision(ball1, ball2) {
    // 碰撞计数器递增
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 验证并修正速度（保持恒定速度360）
    this.balls.children.entries.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏离360，进行修正（考虑浮点误差）
      if (Math.abs(currentSpeed - 360) > 1) {
        const scale = 360 / currentSpeed;
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