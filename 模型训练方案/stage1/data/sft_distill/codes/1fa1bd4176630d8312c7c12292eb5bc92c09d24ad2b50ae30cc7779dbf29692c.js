class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 状态信号：碰撞次数
    this.ballCount = 12; // 状态信号：小球数量
  }

  preload() {
    // 使用 Graphics 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('pinkBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      key: 'pinkBall',
      repeat: this.ballCount - 1, // 总共12个小球
      setXY: {
        x: 100,
        y: 100,
        stepX: 60,
        stepY: 60
      }
    });

    // 为每个小球设置属性
    this.balls.children.entries.forEach((ball, index) => {
      // 设置随机位置（避免重叠）
      ball.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );

      // 设置碰撞边界反弹
      ball.setCollideWorldBounds(true);
      
      // 设置完全弹性碰撞（反弹系数为1）
      ball.setBounce(1, 1);

      // 设置随机速度，速度大小为200
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 200;
      const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 200;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加边界碰撞监听（用于统计）
    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
      this.updateStatusText();
    });
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调：记录碰撞次数
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 200 px/s`
    ]);
  }

  update(time, delta) {
    // 确保速度保持在200左右（补偿浮点误差）
    this.balls.children.entries.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过5%，进行修正
      if (Math.abs(currentSpeed - 200) > 10) {
        const scale = 200 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

// 游戏配置
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
  scene: BallCollisionScene
};

// 创建游戏实例
new Phaser.Game(config);