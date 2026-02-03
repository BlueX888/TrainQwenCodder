class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('whiteBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'whiteBall',
      repeat: 7, // 创建 8 个物体（0-7）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 为每个物体设置随机位置和速度
    const balls = this.balls.getChildren();
    balls.forEach((ball, index) => {
      // 随机位置
      ball.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );

      // 随机速度（范围在 -200 到 200 之间）
      const angle = Phaser.Math.Between(0, 360);
      const speed = 200;
      const velocityX = Math.cos(angle * Math.PI / 180) * speed;
      const velocityY = Math.sin(angle * Math.PI / 180) * speed;
      
      ball.setVelocity(velocityX, velocityY);
    });

    // 设置物体间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleCollision, null, this);

    // 添加文本显示碰撞计数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 添加边界显示
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 0.5);
    border.strokeRect(0, 0, 800, 600);
  }

  handleCollision(ball1, ball2) {
    // 碰撞时增加计数器
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保所有物体保持恒定速度
    const balls = this.balls.getChildren();
    balls.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏离 200，重新归一化
      if (Math.abs(currentSpeed - 200) > 1) {
        const normalizedX = (velocity.x / currentSpeed) * 200;
        const normalizedY = (velocity.y / currentSpeed) * 200;
        ball.setVelocity(normalizedX, normalizedY);
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