class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 状态信号：记录碰撞次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('pinkBall', 32, 32);
    graphics.destroy();

    // 创建物理组来管理所有球
    this.balls = this.physics.add.group({
      key: 'pinkBall',
      repeat: 7, // 创建8个球（0-7）
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 为每个球设置随机位置和速度
    const ballArray = this.balls.getChildren();
    ballArray.forEach((ball, index) => {
      // 随机位置（避免重叠，分散放置）
      const x = 100 + (index % 4) * 200 + Phaser.Math.Between(-30, 30);
      const y = 100 + Math.floor(index / 4) * 400 + Phaser.Math.Between(-30, 30);
      ball.setPosition(x, y);

      // 设置随机方向的速度，速度大小为120
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * 120;
      const velocityY = Math.sin(angle * Math.PI / 180) * 120;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.setCircle(16);
    });

    // 添加球与球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, null, this);

    // 显示碰撞计数器
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明文字
    this.add.text(10, 50, '8 pink balls bouncing at speed 120', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界提示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, this.game.config.width, this.game.config.height);
  }

  handleBallCollision(ball1, ball2) {
    // 碰撞回调函数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 可选：确保速度保持在120左右（考虑浮点误差）
    const ballArray = this.balls.getChildren();
    ballArray.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差较大，重新归一化到120
      if (Math.abs(currentSpeed - 120) > 5) {
        const scale = 120 / currentSpeed;
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
      debug: false // 设为 true 可查看碰撞体
    }
  },
  scene: BallBounceScene
};

new Phaser.Game(config);