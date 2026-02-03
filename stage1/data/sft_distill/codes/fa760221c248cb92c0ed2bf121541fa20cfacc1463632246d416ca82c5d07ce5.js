class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.totalBalls = 15; // 状态信号：小球总数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('orangeBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.ballGroup = this.physics.add.group({
      key: 'orangeBall',
      repeat: this.totalBalls - 1, // 创建15个小球
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 为每个小球设置随机位置和速度
    const balls = this.ballGroup.getChildren();
    balls.forEach((ball, index) => {
      // 随机位置（避免重叠）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 设置随机速度方向，总速度约120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 120;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);

      // 设置圆形物理体（更准确的碰撞检测）
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.ballGroup, this.ballGroup, this.onBallCollision, null, this);

    // 添加信息文本显示状态
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新信息显示
    this.updateInfo();
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调：增加碰撞计数
    this.collisionCount++;
    this.updateInfo();
  }

  updateInfo() {
    // 更新状态信息显示
    this.infoText.setText([
      `小球数量: ${this.totalBalls}`,
      `碰撞次数: ${this.collisionCount}`,
      `目标速度: 120 px/s`
    ]);
  }

  update(time, delta) {
    // 可选：监控小球速度，确保保持在目标速度附近
    // 由于是完全弹性碰撞，速度应该保持恒定
    const balls = this.ballGroup.getChildren();
    balls.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差过大，进行微调（防止数值误差累积）
      if (Math.abs(currentSpeed - 120) > 5) {
        const scale = 120 / currentSpeed;
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
      debug: false // 设为 true 可查看物理边界
    }
  },
  scene: BallBounceScene
};

new Phaser.Game(config);