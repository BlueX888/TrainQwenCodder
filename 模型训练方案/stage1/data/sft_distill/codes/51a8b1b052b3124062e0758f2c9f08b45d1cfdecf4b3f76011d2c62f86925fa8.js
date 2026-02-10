class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 验证状态信号：碰撞计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0088ff, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('blueBall', 20, 20);
    graphics.destroy();

    // 创建物理精灵组
    this.ballGroup = this.physics.add.group({
      key: 'blueBall',
      quantity: 20,
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 为每个小球设置随机初始速度和位置
    const balls = this.ballGroup.getChildren();
    balls.forEach(ball => {
      // 随机位置（避免边缘）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 随机角度，固定速度 160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 160;
      const velocityY = Math.sin(angle) * 160;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.setCircle(10);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.ballGroup, this.ballGroup, this.onBallCollision, null, this);

    // 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setDepth(1000);

    // 绘制边界提示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, 800, 600);

    // 添加速度信息显示
    this.speedText = this.add.text(10, 40, 'Ball Speed: 160', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.speedText.setDepth(1000);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保小球速度保持在 160（可选：补偿物理引擎的速度损失）
    const balls = this.ballGroup.getChildren();
    balls.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过 5%，进行修正
      if (Math.abs(currentSpeed - 160) > 8) {
        const scale = 160 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

// 游戏配置
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
  scene: BallCollisionScene
};

// 启动游戏
new Phaser.Game(config);