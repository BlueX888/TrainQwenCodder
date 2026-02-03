class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0;
    this.ballCollisionCount = 0;
    this.worldCollisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 使用 Graphics 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFF00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();

    // 创建球体数组
    this.balls = [];
    const ballPositions = [
      { x: width * 0.25, y: height * 0.3 },
      { x: width * 0.75, y: height * 0.3 },
      { x: width * 0.5, y: height * 0.7 }
    ];

    // 创建3个黄色小球
    for (let i = 0; i < 3; i++) {
      const ball = this.physics.add.sprite(
        ballPositions[i].x,
        ballPositions[i].y,
        'yellowBall'
      );

      // 设置物理属性
      ball.setCollideWorldBounds(true); // 与世界边界碰撞
      ball.setBounce(1); // 完全弹性碰撞（反弹系数为1）
      
      // 设置随机速度，确保总速度约为80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 80;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);

      // 监听与世界边界的碰撞
      ball.body.onWorldBounds = true;

      this.balls.push(ball);
    }

    // 添加球体之间的碰撞检测
    this.physics.add.collider(this.balls[0], this.balls[1], this.onBallCollision, null, this);
    this.physics.add.collider(this.balls[0], this.balls[2], this.onBallCollision, null, this);
    this.physics.add.collider(this.balls[1], this.balls[2], this.onBallCollision, null, this);

    // 监听世界边界碰撞事件
    this.physics.world.on('worldbounds', (body) => {
      this.worldCollisionCount++;
      this.updateSignals();
    });

    // 初始化信号
    this.updateSignals();

    // 添加文本显示碰撞信息
    this.collisionText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateCollisionText();
  }

  onBallCollision(ball1, ball2) {
    this.ballCollisionCount++;
    this.collisionCount++;
    this.updateSignals();
    this.updateCollisionText();
  }

  updateCollisionText() {
    this.collisionText.setText([
      `Total Collisions: ${this.collisionCount}`,
      `Ball-Ball: ${this.ballCollisionCount}`,
      `Ball-Wall: ${this.worldCollisionCount}`
    ]);
  }

  updateSignals() {
    // 输出可验证的信号
    window.__signals__ = {
      collisionCount: this.collisionCount,
      ballCollisionCount: this.ballCollisionCount,
      worldCollisionCount: this.worldCollisionCount,
      ballCount: this.balls.length,
      ballsData: this.balls.map((ball, index) => ({
        id: index,
        x: Math.round(ball.x),
        y: Math.round(ball.y),
        velocityX: Math.round(ball.body.velocity.x),
        velocityY: Math.round(ball.body.velocity.y),
        speed: Math.round(Math.sqrt(
          ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
        ))
      })),
      timestamp: Date.now()
    };

    // 输出日志 JSON
    if (this.collisionCount % 10 === 0 && this.collisionCount > 0) {
      console.log(JSON.stringify({
        event: 'collision_milestone',
        count: this.collisionCount,
        ballCollisions: this.ballCollisionCount,
        worldCollisions: this.worldCollisionCount
      }));
    }
  }

  update(time, delta) {
    // 每帧更新碰撞文本
    this.updateCollisionText();
    
    // 定期更新信号
    if (time % 100 < delta) {
      this.updateSignals();
    }
  }
}

// Phaser 游戏配置
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
  scene: BallBounceScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化全局信号对象
window.__signals__ = {
  collisionCount: 0,
  ballCollisionCount: 0,
  worldCollisionCount: 0,
  ballCount: 3
};