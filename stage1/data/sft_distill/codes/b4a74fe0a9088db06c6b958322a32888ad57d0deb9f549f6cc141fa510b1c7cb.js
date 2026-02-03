class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证状态：碰撞计数
    this.ballCount = 10; // 小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 使用 Graphics 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: this.ballCount - 1,
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的随机位置和速度
    this.balls.children.iterate((ball) => {
      // 随机位置（避免太靠近边缘）
      ball.setPosition(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height - 50)
      );

      // 计算随机角度，速度为360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 360;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;

      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.setCircle(16);
    });

    // 启用小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数器
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示小球数量
    this.ballCountText = this.add.text(10, 40, `Balls: ${this.ballCount}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界提示
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 0.5);
    border.strokeRect(0, 0, width, height);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞计数器递增
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 可选：在这里可以添加额外的更新逻辑
    // 当前物理系统自动处理碰撞和运动
  }
}

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
  scene: GameScene
};

new Phaser.Game(config);