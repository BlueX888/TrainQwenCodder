class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.ballCount = 15; // 状态信号：小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('pinkBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'pinkBall',
      repeat: this.ballCount - 1, // 创建15个小球
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 为每个小球设置随机位置和速度
    const speed = 120;
    this.balls.children.iterate((ball) => {
      // 随机位置（避免边界）
      ball.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );

      // 随机方向，但速度大小固定为120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      ball.setVelocity(velocityX, velocityY);
      
      // 设置弹性系数为1（完全弹性碰撞）
      ball.setBounce(1, 1);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加调试信息（可选）
    console.log('Game initialized with', this.ballCount, 'pink balls');
    console.log('Each ball speed:', speed);
  }

  handleCollision(ball1, ball2) {
    // 碰撞计数器递增
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `FPS: ${Math.round(this.game.loop.actualFps)}`
    ]);

    // 验证速度保持在120左右（考虑浮点误差）
    // 这是可选的调试代码
    if (time % 1000 < 16) { // 每秒检查一次
      this.balls.children.iterate((ball) => {
        const velocity = ball.body.velocity;
        const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        // 如果速度偏差过大，重新归一化（处理数值误差）
        if (Math.abs(currentSpeed - 120) > 5) {
          const factor = 120 / currentSpeed;
          ball.setVelocity(velocity.x * factor, velocity.y * factor);
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
      debug: false // 设为true可以看到物理边界
    }
  },
  scene: GameScene
};

new Phaser.Game(config);