class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：记录碰撞次数
    this.ballCount = 5; // 状态信号：小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1); // 红色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('redBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'redBall',
      repeat: 4, // 创建5个小球（1个基础 + 4个重复）
      bounceX: 1, // X轴完全弹性碰撞
      bounceY: 1, // Y轴完全弹性碰撞
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 设置每个小球的随机初始位置和速度
    const speed = 240;
    this.balls.children.entries.forEach((ball, index) => {
      // 随机位置（避免初始重叠）
      const x = 100 + (index * 150);
      const y = 100 + (index % 2) * 400;
      ball.setPosition(x, y);

      // 随机方向，但保持速度大小为240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界碰撞计数
    this.balls.children.entries.forEach(ball => {
      ball.body.onWorldBounds = true;
    });

    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
    });
  }

  onBallCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 240 px/s`
    ]);

    // 验证速度保持在240左右（允许浮点误差）
    this.balls.children.entries.forEach((ball, index) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差过大，重新校正（处理浮点精度问题）
      const speedDiff = Math.abs(currentSpeed - 240);
      if (speedDiff > 1) {
        const scale = 240 / currentSpeed;
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