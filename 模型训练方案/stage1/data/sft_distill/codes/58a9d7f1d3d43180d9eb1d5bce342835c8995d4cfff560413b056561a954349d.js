class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.ballBoundaryCollisions = 0;
    this.ballBallCollisions = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建紫色小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9933ff, 1); // 紫色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('purpleBall', 32, 32);
    graphics.destroy();

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      key: 'purpleBall',
      repeat: 11, // 创建12个小球（1 + 11）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的初始位置和速度
    const ballsArray = this.balls.getChildren();
    ballsArray.forEach((ball, index) => {
      // 随机分布位置，避免重叠
      const angle = (index / 12) * Math.PI * 2;
      const radius = 150;
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;
      
      ball.setPosition(x, y);
      
      // 设置随机方向，速度为120
      const randomAngle = Math.random() * Math.PI * 2;
      const velocityX = Math.cos(randomAngle) * 120;
      const velocityY = Math.sin(randomAngle) * 120;
      
      ball.setVelocity(velocityX, velocityY);
      ball.setBounce(1); // 完全弹性碰撞
      ball.setCircle(16); // 设置碰撞体为圆形
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', (body) => {
      this.ballBoundaryCollisions++;
      this.updateSignals();
    });

    // 启用世界边界事件
    this.physics.world.setBoundsCollision(true, true, true, true);
    ballsArray.forEach(ball => {
      ball.body.onWorldBounds = true;
    });

    // 初始化信号
    this.updateSignals();

    // 添加文本显示
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  onBallCollision(ball1, ball2) {
    this.ballBallCollisions++;
    this.collisionCount++;
    this.updateSignals();
  }

  updateSignals() {
    // 输出可验证的信号
    window.__signals__ = {
      ballCount: 12,
      speed: 120,
      totalCollisions: this.collisionCount,
      ballBallCollisions: this.ballBallCollisions,
      ballBoundaryCollisions: this.ballBoundaryCollisions,
      timestamp: Date.now()
    };

    // 同时输出日志
    console.log(JSON.stringify(window.__signals__));
  }

  update(time, delta) {
    // 更新显示文本
    if (this.statsText) {
      this.statsText.setText([
        `小球数量: ${window.__signals__.ballCount}`,
        `设定速度: ${window.__signals__.speed}`,
        `总碰撞次数: ${window.__signals__.totalCollisions}`,
        `球球碰撞: ${window.__signals__.ballBallCollisions}`,
        `边界碰撞: ${window.__signals__.ballBoundaryCollisions}`
      ]);
    }

    // 验证速度保持在120左右（允许小误差）
    const ballsArray = this.balls.getChildren();
    ballsArray.forEach(ball => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差过大，重新规范化到120
      if (Math.abs(speed - 120) > 5) {
        const normalizedVx = (ball.body.velocity.x / speed) * 120;
        const normalizedVy = (ball.body.velocity.y / speed) * 120;
        ball.setVelocity(normalizedVx, normalizedVy);
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
  scene: GameScene
};

const game = new Phaser.Game(config);