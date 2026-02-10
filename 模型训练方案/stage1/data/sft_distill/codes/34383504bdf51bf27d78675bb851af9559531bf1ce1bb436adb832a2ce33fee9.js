class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞次数
    this.ballCount = 8; // 状态信号：小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 设置物理世界边界，启用边界碰撞
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 使用Graphics生成紫色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('purpleBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'purpleBall',
      repeat: 7, // 创建8个球（0-7）
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 为每个小球设置随机位置和速度
    const balls = this.balls.getChildren();
    balls.forEach((ball, index) => {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 随机方向，固定速度200
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 200;
      const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 200;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体（更精确）
      ball.setCircle(16);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界框（可视化）
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(0, 0, width, height);
  }

  handleBallCollision(ball1, ball2) {
    // 碰撞回调：增加碰撞计数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 确保速度保持在200左右（防止浮点误差累积）
    const balls = this.balls.getChildren();
    balls.forEach(ball => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差超过5%，重新归一化
      if (Math.abs(currentSpeed - 200) > 10) {
        const scale = 200 / currentSpeed;
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
  scene: GameScene
};

new Phaser.Game(config);