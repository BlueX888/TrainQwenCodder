class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.ballCount = 8; // 状态信号：小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      key: 'yellowBall',
      repeat: 7, // 创建8个小球（1 + 7）
      setXY: {
        x: 100,
        y: 100,
        stepX: 80,
        stepY: 80
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball) => {
      // 设置弹性系数为1（完全弹性碰撞）
      ball.setBounce(1, 1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度，速度大小为120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * 120;
      const vy = Math.sin(angle) * 120;
      ball.setVelocity(vx, vy);
      
      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加调试信息（可选）
    this.debugText = this.add.text(16, 60, 'Yellow balls bouncing in enclosed space', {
      fontSize: '14px',
      fill: '#00ff00'
    });
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调：增加碰撞计数
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText(
      `Balls: ${this.ballCount} | Collisions: ${this.collisionCount}`
    );
  }

  update(time, delta) {
    // 可选：确保速度保持恒定（补偿浮点误差）
    this.balls.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏离120太多，进行修正
      if (Math.abs(speed - 120) > 1) {
        const scale = 120 / speed;
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
      debug: false // 设置为true可查看碰撞体
    }
  },
  scene: GameScene
};

new Phaser.Game(config);