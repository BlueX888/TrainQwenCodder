class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 状态信号：记录碰撞次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('orangeBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'orangeBall',
      repeat: 9, // 创建10个小球（0-9）
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 设置每个小球的随机位置和速度
    const ballsArray = this.balls.getChildren();
    ballsArray.forEach((ball, index) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 随机方向，固定速度360
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * 360;
      const velocityY = Math.sin(angle * Math.PI / 180) * 360;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.setCircle(16);
    });

    // 小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 添加文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界线可视化
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 1);
    bounds.strokeRect(0, 0, 800, 600);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
      this.updateCollisionText();
    });
  }

  onBallCollision(ball1, ball2) {
    // 小球碰撞回调
    this.collisionCount++;
    this.updateCollisionText();
  }

  updateCollisionText() {
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保速度保持在360左右（补偿浮点误差）
    const ballsArray = this.balls.getChildren();
    ballsArray.forEach(ball => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差超过5%，重新归一化
      if (Math.abs(currentSpeed - 360) > 18) {
        const scale = 360 / currentSpeed;
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
  scene: BallCollisionScene
};

new Phaser.Game(config);