class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 设置世界边界碰撞
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 使用 Graphics 生成白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ballTexture', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.ballGroup = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建5个小球
    const speed = 360;
    const ballCount = 5;

    for (let i = 0; i < ballCount; i++) {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);

      // 创建小球
      const ball = this.ballGroup.create(x, y, 'ballTexture');
      
      // 设置随机速度方向，但保持总速度为360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      ball.setVelocity(velocityX, velocityY);
      
      // 设置圆形碰撞体（更精确）
      ball.body.setCircle(16);
    }

    // 添加小球之间的碰撞检测
    this.physics.add.collider(
      this.ballGroup, 
      this.ballGroup,
      this.onBallCollision,
      null,
      this
    );

    // 添加调试文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 40, 'White balls bounce off walls and each other', {
      fontSize: '16px',
      fill: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界框（可选，用于可视化）
    const border = this.add.graphics();
    border.lineStyle(2, 0x00ff00, 0.5);
    border.strokeRect(0, 0, width, height);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调：增加计数器
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保小球速度保持恒定（可选，防止浮点误差累积）
    const targetSpeed = 360;
    const tolerance = 5;

    this.ballGroup.getChildren().forEach(ball => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );

      // 如果速度偏差超过容差，重新归一化
      if (Math.abs(currentSpeed - targetSpeed) > tolerance) {
        const scale = targetSpeed / currentSpeed;
        ball.body.velocity.x *= scale;
        ball.body.velocity.y *= scale;
      }
    });
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
  scene: BallCollisionScene
};

new Phaser.Game(config);