class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 状态信号：碰撞次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: 4, // 创建5个小球（0-4）
      setXY: {
        x: 100,
        y: 100,
        stepX: 150
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball) => {
      // 设置弹性系数为1（完全弹性碰撞）
      ball.setBounce(1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度，速度大小为360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 360;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      ball.setVelocity(velocityX, velocityY);
      
      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数文本
    this.collisionText = this.add.text(16, 16, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加边界显示（可选，便于可视化）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 1);
    bounds.strokeRect(0, 0, this.scale.width, this.scale.height);
  }

  onBallCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 可选：验证速度保持恒定（弹性碰撞应保持动能）
    this.balls.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏离360，重新归一化（处理浮点误差）
      if (Math.abs(currentSpeed - 360) > 1) {
        const scale = 360 / currentSpeed;
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

new Phaser.Game(config);