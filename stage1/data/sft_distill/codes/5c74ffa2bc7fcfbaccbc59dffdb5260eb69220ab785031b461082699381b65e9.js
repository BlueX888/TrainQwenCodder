class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 碰撞计数器（可验证状态）
    this.ballCount = 8; // 小球数量（可验证状态）
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

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'yellowBall',
      repeat: this.ballCount - 1, // 创建8个小球
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 设置每个小球的随机位置和速度
    const balls = this.balls.getChildren();
    balls.forEach((ball, index) => {
      // 随机位置（避免重叠，使用网格布局）
      const row = Math.floor(index / 4);
      const col = index % 4;
      ball.setPosition(150 + col * 150, 150 + row * 150);
      
      // 设置随机速度方向，速度大小为120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 120;
      const velocityY = Math.sin(angle) * 120;
      ball.setVelocity(velocityX, velocityY);
      
      // 设置圆形碰撞体
      ball.setCircle(16);
    });

    // 设置小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界框（可视化）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 1);
    bounds.strokeRect(0, 0, this.scale.width, this.scale.height);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加碰撞计数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Ball Count: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `FPS: ${Math.round(this.game.loop.actualFps)}`
    ]);

    // 验证所有小球速度保持在120左右（弹性碰撞验证）
    const balls = this.balls.getChildren();
    balls.forEach(ball => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      // 如果速度衰减，重新设置为120（确保完全弹性）
      if (Math.abs(speed - 120) > 1) {
        const angle = Math.atan2(ball.body.velocity.y, ball.body.velocity.x);
        ball.setVelocity(Math.cos(angle) * 120, Math.sin(angle) * 120);
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