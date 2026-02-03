class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.ballCount = 5; // 小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'yellowBall',
      repeat: this.ballCount - 1, // 创建5个小球
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 设置每个小球的随机位置和速度
    const balls = this.balls.getChildren();
    balls.forEach((ball, index) => {
      // 随机位置（避免边缘）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      ball.setPosition(x, y);

      // 随机方向，固定速度240
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * 240;
      const velocityY = Math.sin(angle * Math.PI / 180) * 240;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体（更精确）
      ball.setCircle(16);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示边界（可选，用于调试）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, 800, 600);

    this.updateStatus();
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加计数
    this.collisionCount++;
    this.updateStatus();
  }

  updateStatus() {
    // 更新状态显示
    const balls = this.balls.getChildren();
    let totalSpeed = 0;
    
    balls.forEach(ball => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      totalSpeed += speed;
    });

    const avgSpeed = (totalSpeed / this.ballCount).toFixed(1);

    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Avg Speed: ${avgSpeed}`
    ]);
  }

  update(time, delta) {
    // 每秒更新一次状态显示
    if (!this.lastUpdate || time - this.lastUpdate > 1000) {
      this.updateStatus();
      this.lastUpdate = time;
    }

    // 确保速度保持在240左右（补偿浮点误差）
    const balls = this.balls.getChildren();
    balls.forEach(ball => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差超过5%，进行修正
      if (Math.abs(currentSpeed - 240) > 12) {
        const scale = 240 / currentSpeed;
        ball.setVelocity(
          ball.body.velocity.x * scale,
          ball.body.velocity.y * scale
        );
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
      debug: false // 设置为true可查看碰撞体
    }
  },
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);