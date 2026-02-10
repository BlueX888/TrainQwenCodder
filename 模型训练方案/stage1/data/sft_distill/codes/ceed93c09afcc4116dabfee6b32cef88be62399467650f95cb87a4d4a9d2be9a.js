class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.ballCollisionCount = 0;
    this.boundaryCollisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      collisionCount: 0,
      ballCollisionCount: 0,
      boundaryCollisionCount: 0,
      balls: [],
      timestamp: Date.now()
    };

    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'blueBall',
      repeat: 4, // 创建5个小球（0-4）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的位置和速度
    const ballsArray = this.balls.getChildren();
    ballsArray.forEach((ball, index) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      ball.setPosition(x, y);

      // 随机方向，固定速度300
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * 300;
      const velocityY = Math.sin(angle * Math.PI / 180) * 300;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.setCircle(16);

      // 记录小球信息
      window.__signals__.balls.push({
        id: index,
        x: x,
        y: y,
        velocityX: velocityX,
        velocityY: velocityY
      });
    });

    // 添加小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', (body) => {
      this.boundaryCollisionCount++;
      window.__signals__.boundaryCollisionCount = this.boundaryCollisionCount;
      window.__signals__.timestamp = Date.now();
      
      console.log(JSON.stringify({
        type: 'boundary_collision',
        count: this.boundaryCollisionCount,
        position: { x: body.x, y: body.y }
      }));
    });

    // 启用边界碰撞事件
    ballsArray.forEach(ball => {
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
    this.ballCollisionCount++;
    this.collisionCount++;
    
    window.__signals__.ballCollisionCount = this.ballCollisionCount;
    window.__signals__.collisionCount = this.collisionCount;
    window.__signals__.timestamp = Date.now();

    console.log(JSON.stringify({
      type: 'ball_collision',
      count: this.ballCollisionCount,
      ball1: { x: ball1.x, y: ball1.y },
      ball2: { x: ball2.x, y: ball2.y }
    }));
  }

  update(time, delta) {
    // 更新调试信息
    this.debugText.setText([
      `Total Collisions: ${this.collisionCount}`,
      `Ball-Ball: ${this.ballCollisionCount}`,
      `Ball-Boundary: ${this.boundaryCollisionCount}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 更新小球位置信息到signals
    const ballsArray = this.balls.getChildren();
    window.__signals__.balls = ballsArray.map((ball, index) => ({
      id: index,
      x: Math.round(ball.x),
      y: Math.round(ball.y),
      velocityX: Math.round(ball.body.velocity.x),
      velocityY: Math.round(ball.body.velocity.y),
      speed: Math.round(Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      ))
    }));
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
  scene: GameScene
};

const game = new Phaser.Game(config);