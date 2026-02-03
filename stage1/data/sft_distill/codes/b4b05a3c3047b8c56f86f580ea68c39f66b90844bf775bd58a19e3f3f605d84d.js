class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.balls = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      collisionCount: 0,
      balls: [],
      timestamp: Date.now()
    };

    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();

    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建 3 个小球
    const positions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 400 }
    ];

    const velocities = [
      { x: 80, y: 60 },
      { x: -70, y: 80 },
      { x: 50, y: -80 }
    ];

    for (let i = 0; i < 3; i++) {
      const ball = this.physics.add.sprite(
        positions[i].x,
        positions[i].y,
        'yellowBall'
      );

      // 设置物理属性
      ball.setCollideWorldBounds(true); // 与世界边界碰撞
      ball.setBounce(1); // 完全弹性碰撞（反弹系数为1）
      ball.setVelocity(velocities[i].x, velocities[i].y);
      ball.setCircle(16); // 设置圆形碰撞体
      ball.name = `ball_${i}`;

      this.balls.push(ball);
    }

    // 设置小球之间的碰撞
    this.physics.add.collider(
      this.balls[0],
      this.balls[1],
      this.onBallCollision,
      null,
      this
    );
    this.physics.add.collider(
      this.balls[0],
      this.balls[2],
      this.onBallCollision,
      null,
      this
    );
    this.physics.add.collider(
      this.balls[1],
      this.balls[2],
      this.onBallCollision,
      null,
      this
    );

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', (body) => {
      this.collisionCount++;
      console.log(JSON.stringify({
        type: 'worldbounds',
        collisionCount: this.collisionCount,
        ballName: body.gameObject.name,
        position: { x: body.x, y: body.y },
        velocity: { x: body.velocity.x, y: body.velocity.y }
      }));
    });

    // 启用世界边界事件
    this.balls.forEach(ball => {
      ball.body.onWorldBounds = true;
    });

    // 显示调试信息
    this.add.text(10, 10, 'Elastic Collision Demo', {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.collisionText = this.add.text(10, 40, 'Collisions: 0', {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  onBallCollision(ball1, ball2) {
    this.collisionCount++;
    
    console.log(JSON.stringify({
      type: 'ball_collision',
      collisionCount: this.collisionCount,
      ball1: ball1.name,
      ball2: ball2.name,
      positions: {
        ball1: { x: ball1.x, y: ball1.y },
        ball2: { x: ball2.x, y: ball2.y }
      },
      velocities: {
        ball1: { x: ball1.body.velocity.x, y: ball1.body.velocity.y },
        ball2: { x: ball2.body.velocity.x, y: ball2.body.velocity.y }
      }
    }));
  }

  update(time, delta) {
    // 更新显示
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 更新信号状态
    window.__signals__.collisionCount = this.collisionCount;
    window.__signals__.balls = this.balls.map(ball => ({
      name: ball.name,
      position: { x: Math.round(ball.x), y: Math.round(ball.y) },
      velocity: {
        x: Math.round(ball.body.velocity.x),
        y: Math.round(ball.body.velocity.y)
      },
      speed: Math.round(
        Math.sqrt(
          ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
        )
      )
    }));
    window.__signals__.timestamp = time;

    // 确保速度保持在目标范围（补偿精度损失）
    this.balls.forEach(ball => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏离目标速度太多，进行修正
      const targetSpeed = 100; // 目标速度约为 80-100
      if (Math.abs(speed - targetSpeed) > 5) {
        const scale = targetSpeed / speed;
        ball.body.velocity.x *= scale;
        ball.body.velocity.y *= scale;
      }
    });
  }
}

// 游戏配置
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
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);