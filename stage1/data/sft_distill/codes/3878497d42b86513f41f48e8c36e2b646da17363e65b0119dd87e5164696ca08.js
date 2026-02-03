class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 状态信号：记录碰撞次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 使用 Graphics 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: 9, // 创建 10 个小球（0-9）
      setXY: {
        x: 100,
        y: 100,
        stepX: 70,
        stepY: 0
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball) => {
      // 设置边界碰撞和反弹
      ball.setCollideWorldBounds(true);
      ball.setBounce(1, 1); // 完全弹性碰撞

      // 设置随机方向，速度为 360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * 360;
      const vy = Math.sin(angle) * 360;
      ball.setVelocity(vx, vy);

      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, null, this);

    // 显示碰撞计数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示说明
    this.add.text(10, 40, 'Green balls bouncing at 360 speed', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  handleBallCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新碰撞计数显示
    this.collisionText.setText('Collisions: ' + this.collisionCount);

    // 验证速度保持在 360 左右（允许微小误差）
    this.balls.children.iterate((ball) => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      
      // 如果速度偏差过大，重新归一化到 360
      if (Math.abs(speed - 360) > 5) {
        const angle = Math.atan2(ball.body.velocity.y, ball.body.velocity.x);
        ball.setVelocity(Math.cos(angle) * 360, Math.sin(angle) * 360);
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
  scene: BallBounceScene
};

// 创建游戏实例
new Phaser.Game(config);