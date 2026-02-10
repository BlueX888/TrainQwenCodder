class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 碰撞计数器（状态信号）
    this.ballCount = 12; // 小球数量
    this.ballSpeed = 360; // 小球速度
  }

  preload() {
    // 使用 Graphics 创建白色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();
  }

  create() {
    const { width, height } = this.cameras.main;

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

    // 为每个小球设置随机位置和速度
    this.balls.children.iterate((ball, index) => {
      // 随机位置（避免太靠近边缘）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 随机方向，固定速度360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * this.ballSpeed;
      const vy = Math.sin(angle) * this.ballSpeed;
      ball.setVelocity(vx, vy);

      // 确保完全弹性碰撞
      ball.setBounce(1, 1);
      
      // 设置圆形碰撞体
      ball.setCircle(16);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 创建信息文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建边界可视化
    this.createBoundaryVisual(width, height);

    // 添加速度信息文本
    this.speedText = this.add.text(10, 50, `Speed: ${this.ballSpeed}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加小球数量信息
    this.ballCountText = this.add.text(10, 85, `Balls: ${this.ballCount}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  createBoundaryVisual(width, height) {
    // 绘制边界框
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0x00ff00, 1);
    graphics.strokeRect(2, 2, width - 4, height - 4);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加计数器
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保所有小球保持恒定速度（补偿物理引擎的能量损失）
    this.balls.children.iterate((ball) => {
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

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BallCollisionScene
};

new Phaser.Game(config);