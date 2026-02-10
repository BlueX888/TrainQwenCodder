class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0;
    this.ballBounceCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 创建紫色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('purpleBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.ballGroup = this.physics.add.group({
      key: 'purpleBall',
      repeat: 11, // 总共12个球（1个初始 + 11个重复）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的随机位置和速度
    const balls = this.ballGroup.getChildren();
    balls.forEach((ball, index) => {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 随机方向，固定速度120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 120;
      const velocityY = Math.sin(angle) * 120;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.setCircle(16);
      ball.body.setBounce(1, 1);
      ball.body.setCollideWorldBounds(true);
      
      // 监听世界边界碰撞
      ball.body.onWorldBounds = true;
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.ballGroup, this.ballGroup, this.onBallCollision, null, this);

    // 监听世界边界碰撞事件
    this.physics.world.on('worldbounds', (body) => {
      this.ballBounceCount++;
      this.updateSignals();
    });

    // 添加调试信息显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化 signals
    this.updateSignals();
  }

  onBallCollision(ball1, ball2) {
    this.collisionCount++;
    this.updateSignals();
  }

  updateSignals() {
    // 更新调试文本
    this.debugText.setText([
      `Balls: ${this.ballGroup.getChildren().length}`,
      `Ball-Ball Collisions: ${this.collisionCount}`,
      `Wall Bounces: ${this.ballBounceCount}`,
      `Total Events: ${this.collisionCount + this.ballBounceCount}`
    ]);

    // 输出可验证的 signals
    window.__signals__ = {
      ballCount: this.ballGroup.getChildren().length,
      collisionCount: this.collisionCount,
      wallBounceCount: this.ballBounceCount,
      totalEvents: this.collisionCount + this.ballBounceCount,
      timestamp: Date.now()
    };

    // 输出 JSON 日志
    if (this.collisionCount % 10 === 0 || this.ballBounceCount % 10 === 0) {
      console.log(JSON.stringify({
        type: 'collision_stats',
        data: window.__signals__
      }));
    }
  }

  update(time, delta) {
    // 验证所有小球速度保持在120左右（考虑浮点误差）
    const balls = this.ballGroup.getChildren();
    balls.forEach(ball => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + 
        ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差过大，重新归一化到120
      if (Math.abs(speed - 120) > 1) {
        const scale = 120 / speed;
        ball.body.setVelocity(
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
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BallCollisionScene
};

const game = new Phaser.Game(config);