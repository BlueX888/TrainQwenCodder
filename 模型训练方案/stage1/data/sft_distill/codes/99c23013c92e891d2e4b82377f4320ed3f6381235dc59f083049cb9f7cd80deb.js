class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 状态信号：碰撞次数统计
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 使用 Graphics 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
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
    this.balls.children.entries.forEach((ball, index) => {
      // 设置圆形物理体（更准确的碰撞检测）
      ball.body.setCircle(16);
      
      // 设置完全弹性碰撞（bounce = 1）
      ball.setBounce(1, 1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度方向，速度大小为160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 160;
      const velocityY = Math.sin(angle) * 160;
      ball.setVelocity(velocityX, velocityY);
    });

    // 设置小球之间的碰撞检测
    this.physics.add.collider(
      this.balls, 
      this.balls, 
      this.onBallCollision, 
      null, 
      this
    );

    // 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 显示说明文字
    this.add.text(10, 40, 'White balls bouncing in enclosed space', {
      fontSize: '16px',
      color: '#cccccc'
    });
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调函数，用于统计碰撞次数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保速度保持在160左右（由于浮点误差可能会有微小变化）
    this.balls.children.entries.forEach((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过1%，重新归一化到160
      if (Math.abs(currentSpeed - 160) > 1.6) {
        const scale = 160 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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