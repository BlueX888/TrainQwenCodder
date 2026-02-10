class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0;
    this.boundaryCollisions = 0;
    this.ballCollisions = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.sys.game.config;

    // 创建红色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('redBall', 32, 32);
    graphics.destroy();

    // 启用世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.ballGroup = this.physics.add.group({
      key: 'redBall',
      repeat: 19, // 总共 20 个球
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 为每个小球设置随机位置和速度
    const balls = this.ballGroup.getChildren();
    balls.forEach((ball, index) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 随机方向，固定速度 80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 添加小球之间的碰撞
    this.physics.add.collider(this.ballGroup, this.ballGroup, this.onBallCollision, null, this);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', () => {
      this.boundaryCollisions++;
      this.collisionCount++;
    });

    // 初始化信号输出
    window.__signals__ = {
      totalCollisions: 0,
      boundaryCollisions: 0,
      ballCollisions: 0,
      activeBalls: 20,
      averageSpeed: 80
    };

    // 添加文本显示（用于调试）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  onBallCollision(ball1, ball2) {
    this.ballCollisions++;
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新信号
    const balls = this.ballGroup.getChildren();
    let totalSpeed = 0;
    
    balls.forEach(ball => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      totalSpeed += speed;
    });

    const averageSpeed = totalSpeed / balls.length;

    window.__signals__ = {
      totalCollisions: this.collisionCount,
      boundaryCollisions: this.boundaryCollisions,
      ballCollisions: this.ballCollisions,
      activeBalls: balls.length,
      averageSpeed: Math.round(averageSpeed * 100) / 100
    };

    // 更新显示文本
    this.statusText.setText([
      `Total Collisions: ${this.collisionCount}`,
      `Boundary: ${this.boundaryCollisions}`,
      `Ball-to-Ball: ${this.ballCollisions}`,
      `Active Balls: ${balls.length}`,
      `Avg Speed: ${averageSpeed.toFixed(2)}`
    ]);

    // 每秒输出一次日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      console.log(JSON.stringify(window.__signals__, null, 2));
      this.lastLogTime = time;
    }
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

new Phaser.Game(config);