class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 1. 使用 Graphics 生成红色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(16, 16, 16); // 半径16像素的圆
    graphics.generateTexture('redBall', 32, 32);
    graphics.destroy();

    // 2. 设置世界边界碰撞
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 3. 创建物理组并添加5个小球
    this.balls = this.physics.add.group({
      key: 'redBall',
      repeat: 4, // 创建5个（0-4）
      setXY: {
        x: 100,
        y: 100,
        stepX: 150,
        stepY: 100
      }
    });

    // 4. 配置每个小球的物理属性
    this.balls.children.iterate((ball) => {
      // 设置弹性系数为1（完全弹性碰撞）
      ball.setBounce(1, 1);
      
      // 设置随机速度（速度大小为240）
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 240;
      const velocityY = Math.sin(angle) * 240;
      ball.setVelocity(velocityX, velocityY);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.body.setCircle(16);
    });

    // 5. 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 6. 添加碰撞计数显示文本
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setScrollFactor(0);
    this.collisionText.setDepth(100);

    // 7. 添加速度显示（用于调试验证）
    this.speedText = this.add.text(10, 40, 'Speed: 240', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.speedText.setScrollFactor(0);
    this.speedText.setDepth(100);
  }

  // 碰撞回调函数
  onBallCollision(ball1, ball2) {
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 验证并修正速度（确保速度始终保持在240左右）
    this.balls.children.iterate((ball) => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差超过5%，进行修正
      if (Math.abs(currentSpeed - 240) > 12) {
        const scale = 240 / currentSpeed;
        ball.setVelocity(
          ball.body.velocity.x * scale,
          ball.body.velocity.y * scale
        );
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
      debug: false // 设置为 true 可查看碰撞体
    }
  },
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);