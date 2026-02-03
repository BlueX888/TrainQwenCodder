class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 15;
    this.ballSpeed = 120;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('pinkBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'pinkBall',
      repeat: this.ballCount - 1, // 总共15个球
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 为每个小球设置随机位置和速度
    this.balls.children.iterate((ball) => {
      // 随机位置（避免太靠近边缘）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 随机方向，固定速度大小为120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * this.ballSpeed;
      const vy = Math.sin(angle) * this.ballSpeed;
      ball.setVelocity(vx, vy);

      // 设置圆形碰撞体
      ball.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数
    this.collisionText = this.add.text(16, 16, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setDepth(1);

    // 显示小球数量和速度信息
    this.infoText = this.add.text(16, 56, `Balls: ${this.ballCount} | Speed: ${this.ballSpeed}`, {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.infoText.setDepth(1);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加计数器
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保小球速度保持恒定（可选，防止浮点误差累积）
    this.balls.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过5%，重新归一化
      if (Math.abs(currentSpeed - this.ballSpeed) > this.ballSpeed * 0.05) {
        const scale = this.ballSpeed / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
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