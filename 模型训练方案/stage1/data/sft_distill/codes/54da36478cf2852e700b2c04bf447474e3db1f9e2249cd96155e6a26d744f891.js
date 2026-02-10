class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 3;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.sys.game.config;

    // 使用 Graphics 生成青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: this.ballCount - 1, // 创建3个小球
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 设置每个小球的初始位置和随机速度
    const balls = this.balls.getChildren();
    balls.forEach((ball, index) => {
      // 分散初始位置
      ball.setPosition(
        100 + index * 250,
        100 + index * 150
      );

      // 设置随机方向的速度，速度大小为360
      const angle = Phaser.Math.Between(0, 360);
      const velocity = this.physics.velocityFromAngle(angle, 360);
      ball.setVelocity(velocity.x, velocity.y);

      // 设置圆形碰撞体
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

    this.updateStatusText();

    // 监听世界边界碰撞事件
    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
      this.updateStatusText();
    });
  }

  onBallCollision(ball1, ball2) {
    // 小球碰撞回调
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 360 px/s`
    ]);
  }

  update(time, delta) {
    // 确保速度保持在360左右（由于浮点误差可能会有微小变化）
    const balls = this.balls.getChildren();
    balls.forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过1%，重新归一化
      if (Math.abs(currentSpeed - 360) > 3.6) {
        const scale = 360 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
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