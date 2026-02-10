class BallScene extends Phaser.Scene {
  constructor() {
    super('BallScene');
    this.collisionCount = 0;
    this.ballCollisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化状态信号
    window.__signals__ = {
      collisionCount: 0,
      ballCollisionCount: 0,
      ballPositions: [],
      ballVelocities: []
    };

    // 创建蓝色球体纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();

    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建球体组
    this.balls = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建5个球体
    const ballSpeed = 300;
    const positions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 300 },
      { x: 250, y: 450 },
      { x: 550, y: 450 }
    ];

    positions.forEach((pos, index) => {
      const ball = this.balls.create(pos.x, pos.y, 'blueBall');
      ball.setCircle(16); // 设置圆形碰撞体
      
      // 设置随机速度方向，但保持速度大小为300
      const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
      const vx = Math.cos(angle) * ballSpeed;
      const vy = Math.sin(angle) * ballSpeed;
      ball.setVelocity(vx, vy);
      
      // 确保完全弹性碰撞
      ball.setBounce(1, 1);
      ball.setCollideWorldBounds(true);
      
      // 设置阻尼为0，保持速度恒定
      ball.setDamping(false);
      ball.body.setAllowGravity(false);
      
      // 为每个球添加名称用于调试
      ball.name = `ball_${index}`;
    });

    // 添加球与球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', (body) => {
      this.collisionCount++;
      window.__signals__.collisionCount = this.collisionCount;
      console.log(JSON.stringify({
        type: 'boundary_collision',
        count: this.collisionCount,
        ball: body.gameObject.name,
        position: { x: body.x, y: body.y }
      }));
    });

    // 启用边界碰撞事件
    this.balls.getChildren().forEach(ball => {
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
    window.__signals__.ballCollisionCount = this.ballCollisionCount;
    
    console.log(JSON.stringify({
      type: 'ball_collision',
      count: this.ballCollisionCount,
      balls: [ball1.name, ball2.name],
      positions: [
        { x: Math.round(ball1.x), y: Math.round(ball1.y) },
        { x: Math.round(ball2.x), y: Math.round(ball2.y) }
      ]
    }));
  }

  update(time, delta) {
    // 更新状态信号
    const ballData = this.balls.getChildren().map(ball => ({
      name: ball.name,
      position: { x: Math.round(ball.x), y: Math.round(ball.y) },
      velocity: { 
        x: Math.round(ball.body.velocity.x), 
        y: Math.round(ball.body.velocity.y) 
      },
      speed: Math.round(Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      ))
    }));

    window.__signals__.ballPositions = ballData.map(b => b.position);
    window.__signals__.ballVelocities = ballData.map(b => b.velocity);

    // 更新调试文本
    this.debugText.setText([
      `Boundary Collisions: ${this.collisionCount}`,
      `Ball Collisions: ${this.ballCollisionCount}`,
      `Balls Active: ${this.balls.getChildren().length}`,
      `Avg Speed: ${Math.round(ballData.reduce((sum, b) => sum + b.speed, 0) / ballData.length)}`
    ]);

    // 确保球的速度保持在300左右（由于浮点误差可能会有微小偏差）
    this.balls.getChildren().forEach(ball => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差超过5%，进行修正
      if (Math.abs(speed - 300) > 15) {
        const scale = 300 / speed;
        ball.setVelocity(
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
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BallScene
};

const game = new Phaser.Game(config);