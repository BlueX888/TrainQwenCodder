class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0;
    this.ballCollisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      collisionCount: 0,
      ballCollisionCount: 0,
      ballPositions: [],
      ballVelocities: []
    };

    // 创建灰色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ballTexture', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ballTexture',
      repeat: 7, // 创建8个球（0-7）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个球的初始位置和速度
    const ballsArray = this.balls.getChildren();
    const speed = 80;

    ballsArray.forEach((ball, index) => {
      // 随机分布位置，避免初始重叠
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 设置随机方向的速度，保持速度大小为80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);

      // 设置完全弹性碰撞
      ball.setBounce(1, 1);
      ball.setCollideWorldBounds(true);

      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 添加球与球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', (body) => {
      this.collisionCount++;
      window.__signals__.collisionCount = this.collisionCount;
      
      // 输出日志JSON
      console.log(JSON.stringify({
        type: 'worldbounds',
        collisionCount: this.collisionCount,
        position: { x: body.x, y: body.y }
      }));
    });

    // 启用世界边界碰撞事件
    ballsArray.forEach(ball => {
      ball.body.onWorldBounds = true;
    });

    // 添加调试文本显示
    this.collisionText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加边界提示
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    this.ballCollisionCount++;
    window.__signals__.ballCollisionCount = this.ballCollisionCount;

    // 输出碰撞日志JSON
    console.log(JSON.stringify({
      type: 'ball_collision',
      ballCollisionCount: this.ballCollisionCount,
      ball1: { x: ball1.x, y: ball1.y },
      ball2: { x: ball2.x, y: ball2.y }
    }));
  }

  update(time, delta) {
    // 更新显示信息
    this.collisionText.setText([
      `边界碰撞次数: ${this.collisionCount}`,
      `小球碰撞次数: ${this.ballCollisionCount}`
    ]);

    // 更新信号数据
    const ballsArray = this.balls.getChildren();
    window.__signals__.ballPositions = ballsArray.map(ball => ({
      x: Math.round(ball.x),
      y: Math.round(ball.y)
    }));
    window.__signals__.ballVelocities = ballsArray.map(ball => ({
      x: Math.round(ball.body.velocity.x),
      y: Math.round(ball.body.velocity.y)
    }));

    // 确保速度保持在80左右（补偿浮点误差）
    ballsArray.forEach(ball => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差超过1%，重新归一化
      if (Math.abs(currentSpeed - 80) > 0.8) {
        const scale = 80 / currentSpeed;
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
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BallCollisionScene
};

new Phaser.Game(config);