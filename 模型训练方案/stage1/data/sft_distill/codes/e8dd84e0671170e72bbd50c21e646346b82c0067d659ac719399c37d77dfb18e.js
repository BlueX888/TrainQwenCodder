class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 使用 Graphics 生成白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: 11, // 创建12个小球 (1 + 11)
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 设置世界边界碰撞
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 为每个小球设置随机位置和速度
    const balls = this.balls.getChildren();
    balls.forEach((ball, index) => {
      // 随机位置（避免重叠）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 随机方向，固定速度80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, () => {
      this.collisionCount++;
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界碰撞计数
    this.boundaryCollisionCount = 0;
    balls.forEach(ball => {
      ball.body.onWorldBounds = true;
    });

    this.physics.world.on('worldbounds', () => {
      this.boundaryCollisionCount++;
    });
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Balls: ${this.balls.getChildren().length}`,
      `Ball Collisions: ${this.collisionCount}`,
      `Boundary Collisions: ${this.boundaryCollisionCount}`,
      `Speed: 80 px/s`
    ]);

    // 验证速度保持在80左右（考虑浮点误差）
    const balls = this.balls.getChildren();
    balls.forEach(ball => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + 
        ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差较大，重新归一化到80
      if (Math.abs(speed - 80) > 1) {
        const normalizedVx = (ball.body.velocity.x / speed) * 80;
        const normalizedVy = (ball.body.velocity.y / speed) * 80;
        ball.setVelocity(normalizedVx, normalizedVy);
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