class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.collisionCount = 0; // 状态信号：碰撞次数
    this.activeCount = 20;   // 状态信号：活跃小球数量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('orangeBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'orangeBall',
      repeat: 19, // 总共20个（0-19）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的随机位置和速度
    const speed = 240;
    this.balls.children.iterate((ball) => {
      // 随机位置（避免边缘）
      ball.x = Phaser.Math.Between(50, 750);
      ball.y = Phaser.Math.Between(50, 550);

      // 随机方向的速度，总速度为240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      ball.setVelocity(velocityX, velocityY);
      
      // 设置弹性系数
      ball.setBounce(1, 1);
      
      // 设置碰撞体
      ball.setCircle(16);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界提示
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 0.5);
    border.strokeRect(0, 0, 800, 600);

    this.updateStatus();
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调
    this.collisionCount++;
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.setText([
      `Active Balls: ${this.activeCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 240 px/s`
    ]);
  }

  update(time, delta) {
    // 可选：监控速度保持恒定（由于弹性碰撞可能有微小误差）
    this.balls.children.iterate((ball) => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过5%，重新归一化
      if (Math.abs(currentSpeed - 240) > 12) {
        const angle = Math.atan2(body.velocity.y, body.velocity.x);
        body.setVelocity(
          Math.cos(angle) * 240,
          Math.sin(angle) * 240
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
  scene: BounceScene
};

new Phaser.Game(config);