class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCollisions = 0; // 球体间碰撞次数
    this.wallCollisions = 0; // 墙壁碰撞次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建 3 个球体，设置随机初始位置和速度
    const positions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 400 }
    ];

    positions.forEach((pos, index) => {
      const ball = this.balls.create(pos.x, pos.y, 'ball');
      
      // 设置随机速度方向，速度大小为 160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 160;
      const velocityY = Math.sin(angle) * 160;
      
      ball.setVelocity(velocityX, velocityY);
      ball.setBounce(1, 1);
      ball.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 设置球体之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, null, this);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', (body) => {
      this.wallCollisions++;
      this.collisionCount++;
    });

    // 启用世界边界事件
    this.physics.world.setBoundsCollision(true, true, true, true);
    this.balls.getChildren().forEach(ball => {
      ball.body.onWorldBounds = true;
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界参考线
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0x00ff00, 0.5);
    bounds.strokeRect(0, 0, this.scale.width, this.scale.height);
  }

  handleBallCollision(ball1, ball2) {
    this.ballCollisions++;
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Total Collisions: ${this.collisionCount}`,
      `Ball-Ball: ${this.ballCollisions}`,
      `Ball-Wall: ${this.wallCollisions}`,
      `Active Balls: ${this.balls.getChildren().length}`
    ]);

    // 确保速度保持恒定（补偿浮点误差）
    this.balls.getChildren().forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏离 160 太多，进行修正
      if (Math.abs(currentSpeed - 160) > 1) {
        const scale = 160 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
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
  scene: GameScene
};

new Phaser.Game(config);