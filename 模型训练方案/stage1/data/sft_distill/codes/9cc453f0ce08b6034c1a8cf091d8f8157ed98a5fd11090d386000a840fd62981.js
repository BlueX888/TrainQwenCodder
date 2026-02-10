class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 20;
    this.ballSpeed = 240;
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
      defaultKey: 'yellowBall',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 生成20个小球
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免边缘生成）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.balls.create(x, y, 'yellowBall');
      
      // 设置随机速度方向
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * this.ballSpeed;
      const velocityY = Math.sin(angle) * this.ballSpeed;
      
      ball.setVelocity(velocityX, velocityY);
      ball.setBounce(1, 1); // 完全弹性碰撞
      ball.setCollideWorldBounds(true);
    }

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数器
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示小球数量
    this.ballCountText = this.add.text(10, 40, `Balls: ${this.ballCount}`, {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界提示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0x00ff00, 1);
    bounds.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 每次小球碰撞时增加计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保所有小球保持恒定速度（可选，补偿物理引擎的微小误差）
    this.balls.children.entries.forEach(ball => {
      const currentSpeed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      
      // 如果速度偏离目标速度超过5%，进行修正
      if (Math.abs(currentSpeed - this.ballSpeed) > this.ballSpeed * 0.05) {
        const scale = this.ballSpeed / currentSpeed;
        ball.body.velocity.x *= scale;
        ball.body.velocity.y *= scale;
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