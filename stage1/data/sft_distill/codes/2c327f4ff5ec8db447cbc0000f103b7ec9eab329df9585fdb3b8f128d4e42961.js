class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证状态：碰撞计数
    this.ballCount = 5; // 小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: this.ballCount - 1, // 总共5个球
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 设置每个小球的随机初始速度（速度大小为360）
    const speed = 360;
    this.balls.children.iterate((ball) => {
      // 随机角度
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      ball.setVelocity(velocityX, velocityY);
      
      // 随机初始位置（避免重叠）
      ball.setPosition(
        Phaser.Math.Between(50, this.scale.width - 50),
        Phaser.Math.Between(50, this.scale.height - 50)
      );
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数（用于验证状态）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 显示小球数量
    this.ballCountText = this.add.text(10, 40, `Balls: ${this.ballCount}`, {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 显示速度信息
    this.speedText = this.add.text(10, 70, 'Speed: 360', {
      fontSize: '20px',
      color: '#ffffff'
    });
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保小球速度保持在360左右（由于浮点误差可能会有微小变化）
    this.balls.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过1%，进行修正
      if (Math.abs(currentSpeed - 360) > 3.6) {
        const scale = 360 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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