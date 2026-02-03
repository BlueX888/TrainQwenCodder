class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 5;
    this.ballSpeed = 240;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成红色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1); // 红色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('redBall', 32, 32);
    graphics.destroy();

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建5个红色小球并设置随机速度
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.balls.create(x, y, 'redBall');
      
      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.setCircle(16);
      
      // 设置随机方向的速度，速度大小为240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * this.ballSpeed;
      const velocityY = Math.sin(angle) * this.ballSpeed;
      ball.setVelocity(velocityX, velocityY);
    }

    // 设置小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数器（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示小球数量信息
    this.infoText = this.add.text(10, 50, `Balls: ${this.ballCount} | Speed: ${this.ballSpeed}`, {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加世界边界可视化（可选）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调函数，增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保小球速度保持恒定（可选，补偿物理引擎的精度损失）
    this.balls.children.entries.forEach(ball => {
      const currentSpeed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      
      // 如果速度偏差超过5%，重新归一化
      if (Math.abs(currentSpeed - this.ballSpeed) > this.ballSpeed * 0.05) {
        const scale = this.ballSpeed / currentSpeed;
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

new Phaser.Game(config);