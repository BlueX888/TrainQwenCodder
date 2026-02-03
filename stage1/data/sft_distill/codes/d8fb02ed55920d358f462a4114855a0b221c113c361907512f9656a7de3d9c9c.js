class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 可验证状态信号：碰撞计数
    this.ballCount = 5; // 小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 使用 Graphics 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('pinkBall', 32, 32);
    graphics.destroy();

    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.ballGroup = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建5个小球
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免太靠近边缘）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      
      const ball = this.ballGroup.create(x, y, 'pinkBall');
      
      // 设置随机速度方向，速度大小为160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 160;
      const velocityY = Math.sin(angle) * 160;
      
      ball.setVelocity(velocityX, velocityY);
      ball.setCircle(16); // 设置圆形碰撞体
      ball.setBounce(1); // 完全弹性碰撞
      ball.setCollideWorldBounds(true);
    }

    // 小球之间的碰撞检测
    this.physics.add.collider(
      this.ballGroup,
      this.ballGroup,
      this.handleBallCollision,
      null,
      this
    );

    // 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示小球信息
    this.infoText = this.add.text(10, 40, `Balls: ${this.ballCount} | Speed: 160`, {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界可视化
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, width, height);
  }

  handleBallCollision(ball1, ball2) {
    // 增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保小球速度保持恒定（可选：补偿物理引擎的精度损失）
    this.ballGroup.children.entries.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过5%，重新归一化到160
      if (Math.abs(currentSpeed - 160) > 8) {
        const scale = 160 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
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
  scene: BallBounceScene
};

const game = new Phaser.Game(config);