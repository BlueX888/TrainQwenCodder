class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证状态：碰撞计数
    this.ballCount = 5; // 可验证状态：小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径 16 的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: this.ballCount - 1, // 创建 5 个小球
      setXY: {
        x: Phaser.Math.Between(50, width - 50),
        y: Phaser.Math.Between(50, height - 50),
        stepX: 0,
        stepY: 0
      }
    });

    // 为每个小球设置属性
    this.balls.children.entries.forEach((ball, index) => {
      // 设置随机位置，避免重叠
      ball.setPosition(
        Phaser.Math.Between(50 + index * 30, width - 50),
        Phaser.Math.Between(50 + index * 30, height - 50)
      );

      // 设置碰撞边界反弹
      ball.setBounce(1, 1); // 完全弹性碰撞
      ball.setCollideWorldBounds(true); // 与世界边界碰撞

      // 设置随机速度方向，速度大小为 240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * 240;
      const vy = Math.sin(angle) * 240;
      ball.setVelocity(vx, vy);

      // 设置圆形碰撞体（更精确）
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.handleCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatus();
  }

  handleCollision(ball1, ball2) {
    // 碰撞回调，增加计数
    this.collisionCount++;
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 240 px/s`
    ]);
  }

  update(time, delta) {
    // 确保速度保持在 240（可选，用于修正浮点误差）
    this.balls.children.entries.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度有偏差，重新归一化到 240
      if (Math.abs(currentSpeed - 240) > 1) {
        const scale = 240 / currentSpeed;
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
  scene: GameScene
};

new Phaser.Game(config);