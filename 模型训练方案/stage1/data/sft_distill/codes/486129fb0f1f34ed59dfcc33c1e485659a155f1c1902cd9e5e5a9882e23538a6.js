class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0;
    this.ballCollisions = 0;
    this.boundaryCollisions = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.sys.game.config;

    // 创建灰色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 设置世界边界
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: 7, // 创建8个小球（0-7）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的随机位置和速度
    const speed = 80;
    this.balls.children.iterate((ball, index) => {
      // 随机位置（避免边界太近）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 随机方向的速度，速度大小为80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);

      // 设置圆形碰撞体
      ball.setCircle(16);
      ball.body.setBounce(1, 1);
      ball.body.setCollideWorldBounds(true);
      
      // 监听边界碰撞
      ball.body.onWorldBounds = true;
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 监听世界边界碰撞事件
    this.physics.world.on('worldbounds', (body) => {
      this.boundaryCollisions++;
      this.updateSignals();
    });

    // 添加显示信息的文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化信号
    this.updateSignals();

    // 添加调试信息（可选）
    console.log('Game started with 8 balls at speed 80');
  }

  onBallCollision(ball1, ball2) {
    this.ballCollisions++;
    this.collisionCount++;
    this.updateSignals();
  }

  updateSignals() {
    // 更新显示文本
    this.infoText.setText([
      `Total Collisions: ${this.collisionCount}`,
      `Ball-Ball: ${this.ballCollisions}`,
      `Ball-Boundary: ${this.boundaryCollisions}`
    ]);

    // 输出可验证的信号
    window.__signals__ = {
      totalCollisions: this.collisionCount,
      ballCollisions: this.ballCollisions,
      boundaryCollisions: this.boundaryCollisions,
      ballCount: 8,
      ballSpeed: 80,
      timestamp: Date.now()
    };

    // 输出 JSON 日志
    if (this.collisionCount % 10 === 0 && this.collisionCount > 0) {
      console.log(JSON.stringify(window.__signals__));
    }
  }

  update(time, delta) {
    // 确保小球速度保持恒定（补偿可能的精度损失）
    this.balls.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      if (currentSpeed > 0 && Math.abs(currentSpeed - 80) > 0.1) {
        const scale = 80 / currentSpeed;
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BallCollisionScene
};

const game = new Phaser.Game(config);