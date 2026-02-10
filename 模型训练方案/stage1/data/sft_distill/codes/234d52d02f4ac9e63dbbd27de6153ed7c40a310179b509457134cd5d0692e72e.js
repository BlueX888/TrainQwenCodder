class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0;
    this.ballCount = 20;
    this.ballSpeed = 200;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      ballCount: this.ballCount,
      collisionCount: 0,
      activeBalls: this.ballCount,
      averageSpeed: 0,
      timestamp: Date.now()
    };

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 使用 Graphics 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'blueBall',
      repeat: this.ballCount - 1,
      setXY: { 
        x: 100, 
        y: 100, 
        stepX: 0, 
        stepY: 0 
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball, index) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 设置随机速度方向
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * this.ballSpeed;
      const velocityY = Math.sin(angle) * this.ballSpeed;
      ball.setVelocity(velocityX, velocityY);

      // 设置弹性系数为1（完全弹性碰撞）
      ball.setBounce(1, 1);

      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);

      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(
      this.balls, 
      this.balls, 
      this.onBallCollision, 
      null, 
      this
    );

    // 添加调试信息显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 输出初始状态
    console.log(JSON.stringify({
      event: 'game_start',
      ballCount: this.ballCount,
      ballSpeed: this.ballSpeed,
      timestamp: Date.now()
    }));
  }

  onBallCollision(ball1, ball2) {
    this.collisionCount++;
    
    // 更新 signals
    window.__signals__.collisionCount = this.collisionCount;
    
    // 每10次碰撞输出一次日志
    if (this.collisionCount % 10 === 0) {
      console.log(JSON.stringify({
        event: 'collision_milestone',
        collisionCount: this.collisionCount,
        timestamp: Date.now()
      }));
    }
  }

  update(time, delta) {
    // 计算所有小球的平均速度
    let totalSpeed = 0;
    let activeBalls = 0;

    this.balls.children.iterate((ball) => {
      if (ball.active) {
        const speed = Math.sqrt(
          ball.body.velocity.x ** 2 + 
          ball.body.velocity.y ** 2
        );
        totalSpeed += speed;
        activeBalls++;
      }
    });

    const averageSpeed = activeBalls > 0 ? totalSpeed / activeBalls : 0;

    // 更新 signals
    window.__signals__.activeBalls = activeBalls;
    window.__signals__.averageSpeed = Math.round(averageSpeed);
    window.__signals__.timestamp = Date.now();
    window.__signals__.collisionCount = this.collisionCount;

    // 更新调试文本
    this.debugText.setText([
      `Active Balls: ${activeBalls}`,
      `Collisions: ${this.collisionCount}`,
      `Avg Speed: ${Math.round(averageSpeed)}`,
      `Target Speed: ${this.ballSpeed}`
    ]);

    // 每秒输出一次状态
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log(JSON.stringify({
        event: 'status_update',
        ...window.__signals__
      }));
    }
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