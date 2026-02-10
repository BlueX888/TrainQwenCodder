class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.ballCount = 20;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      ballCount: this.ballCount,
      collisionCount: 0,
      averageSpeed: 200,
      worldBounds: {
        width: this.physics.world.bounds.width,
        height: this.physics.world.bounds.height
      }
    };

    // 使用Graphics创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建小球组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: this.ballCount - 1,
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的随机位置和速度
    this.balls.children.iterate((ball) => {
      // 随机位置（避免靠近边缘）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 随机方向，固定速度200
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 200;
      const velocityY = Math.sin(angle) * 200;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 添加边界碰撞监听
    this.physics.world.on('worldbounds', (body) => {
      this.collisionCount++;
      window.__signals__.collisionCount = this.collisionCount;
      console.log(JSON.stringify({
        type: 'boundary_collision',
        count: this.collisionCount,
        position: { x: body.x, y: body.y }
      }));
    });

    // 启用世界边界碰撞事件
    this.physics.world.setBoundsCollision(true, true, true, true);
    this.balls.children.iterate((ball) => {
      ball.body.onWorldBounds = true;
    });

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  onBallCollision(ball1, ball2) {
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;
    
    console.log(JSON.stringify({
      type: 'ball_collision',
      count: this.collisionCount,
      ball1: { x: ball1.x, y: ball1.y },
      ball2: { x: ball2.x, y: ball2.y }
    }));
  }

  update(time, delta) {
    // 更新调试信息
    this.debugText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 更新平均速度信息
    let totalSpeed = 0;
    this.balls.children.iterate((ball) => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      totalSpeed += speed;
    });
    
    window.__signals__.averageSpeed = Math.round(totalSpeed / this.ballCount);
    window.__signals__.time = Math.floor(time / 1000);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);