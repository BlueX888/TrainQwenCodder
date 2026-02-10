class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.ballCount = 15; // 小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('pinkBall', 32, 32);
    graphics.destroy();

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      key: 'pinkBall',
      repeat: this.ballCount - 1, // 创建15个小球
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 设置每个小球的随机位置和速度
    this.balls.children.iterate((ball) => {
      // 随机位置（避免重叠在边缘）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 设置随机方向的速度，速度大小为120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 120;
      const velocityY = Math.sin(angle) * 120;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 创建信息文本显示状态
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界碰撞监听
    this.balls.children.iterate((ball) => {
      ball.body.onWorldBounds = true;
    });

    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
    });

    this.updateInfo();
  }

  onBallCollision(ball1, ball2) {
    // 记录小球间的碰撞
    this.collisionCount++;
    this.updateInfo();
  }

  updateInfo() {
    // 更新状态信息
    this.infoText.setText([
      `小球数量: ${this.ballCount}`,
      `碰撞次数: ${this.collisionCount}`,
      `速度: 120 px/s`
    ]);
  }

  update(time, delta) {
    // 确保小球保持恒定速度（消除摩擦力影响）
    this.balls.children.iterate((ball) => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏离120，重新归一化
      if (Math.abs(currentSpeed - 120) > 1) {
        const scale = 120 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
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
      debug: false
    }
  },
  scene: BallCollisionScene
};

// 创建游戏实例
new Phaser.Game(config);