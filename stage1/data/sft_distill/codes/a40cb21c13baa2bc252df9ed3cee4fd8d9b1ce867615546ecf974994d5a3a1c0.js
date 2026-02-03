class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证状态信号：碰撞计数
    this.ballCount = 3; // 球的数量
  }

  preload() {
    // 使用 Graphics 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理组来管理球体
    this.balls = this.physics.add.group();

    // 创建 3 个球体
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const ball = this.balls.create(x, y, 'ball');
      
      // 设置物理属性
      ball.setCollideWorldBounds(true); // 与世界边界碰撞
      ball.setBounce(1); // 完全弹性碰撞（反弹系数为1）
      
      // 设置随机速度方向，速度大小为 80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      ball.setVelocity(velocityX, velocityY);
    }

    // 设置球体之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数文本
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示球体数量
    this.ballCountText = this.add.text(10, 40, `Balls: ${this.ballCount}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示说明
    this.add.text(10, 70, 'Green balls bouncing at speed 80', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  onBallCollision(ball1, ball2) {
    // 球体碰撞时增加计数器
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保球体速度保持在 80 左右（由于浮点数误差可能会有微小变化）
    this.balls.children.entries.forEach(ball => {
      const currentSpeed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      
      // 如果速度偏差超过 1，重新归一化到 80
      if (Math.abs(currentSpeed - 80) > 1) {
        const scale = 80 / currentSpeed;
        ball.setVelocity(ball.body.velocity.x * scale, ball.body.velocity.y * scale);
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

new Phaser.Game(config);