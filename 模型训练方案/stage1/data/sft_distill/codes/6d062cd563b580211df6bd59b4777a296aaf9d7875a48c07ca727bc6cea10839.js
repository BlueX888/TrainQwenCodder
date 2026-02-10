class BallScene extends Phaser.Scene {
  constructor() {
    super('BallScene');
    this.collisionCount = 0; // 碰撞计数器（验证信号）
    this.ballCount = 10; // 小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 设置世界边界碰撞
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: this.ballCount - 1, // 总共10个球
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 为每个小球设置随机位置和速度
    const speed = 360;
    this.balls.children.iterate((ball) => {
      // 随机位置（避免太靠近边缘）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      ball.setPosition(x, y);

      // 随机方向，但保持速度为360
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * speed;
      const velocityY = Math.sin(angle * Math.PI / 180) * speed;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形物理体（更精确的碰撞）
      ball.body.setCircle(16);
    });

    // 添加小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数文本
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示小球数量文本
    this.ballCountText = this.add.text(10, 50, `Balls: ${this.ballCount}`, {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界线（可视化）
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(0, 0, width, height);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 验证速度保持在360左右（由于浮点误差可能略有偏差）
    // 可选：在控制台输出验证信息
    if (time % 1000 < 20) { // 每秒检查一次
      this.balls.children.iterate((ball) => {
        const velocity = ball.body.velocity;
        const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        // 如果速度偏差过大，重新归一化（修正浮点误差）
        if (Math.abs(currentSpeed - 360) > 5) {
          const scale = 360 / currentSpeed;
          ball.setVelocity(velocity.x * scale, velocity.y * scale);
        }
      });
    }
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
      debug: false // 设为 true 可查看物理边界
    }
  },
  scene: BallScene
};

new Phaser.Game(config);