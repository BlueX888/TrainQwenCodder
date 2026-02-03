class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞次数
    this.ballCount = 3; // 状态信号：小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: 2, // 创建3个小球（0 + repeat 2）
      setXY: {
        x: 200,
        y: 200,
        stepX: 200 // 水平间隔200像素
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball) => {
      // 设置完全弹性碰撞（bounce = 1）
      ball.setBounce(1, 1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度，总速度为360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 360;
      ball.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
      
      // 设置圆形碰撞体
      ball.setCircle(16);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateStatus();
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调：记录碰撞次数
    this.collisionCount++;
    this.updateStatus();
  }

  updateStatus() {
    // 更新状态显示
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 360 px/s`
    ]);
  }

  update(time, delta) {
    // 可选：验证小球速度保持在360左右（考虑浮点误差）
    this.balls.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差过大，重新规范化到360
      if (Math.abs(currentSpeed - 360) > 5) {
        const normalizedVelocity = velocity.clone().normalize().scale(360);
        ball.setVelocity(normalizedVelocity.x, normalizedVelocity.y);
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