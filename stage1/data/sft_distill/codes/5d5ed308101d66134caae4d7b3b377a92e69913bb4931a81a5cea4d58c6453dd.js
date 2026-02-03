class BallScene extends Phaser.Scene {
  constructor() {
    super('BallScene');
    this.collisionCount = 0; // 可验证的状态信号：碰撞计数
    this.ballCount = 5; // 小球数量
    this.ballSpeed = 80; // 小球速度
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建5个小球，设置随机位置和速度
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免靠近边界）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const ball = this.balls.create(x, y, 'ball');
      
      // 设置随机速度方向
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * this.ballSpeed;
      const vy = Math.sin(angle) * this.ballSpeed;
      
      ball.setVelocity(vx, vy);
      ball.setBounce(1, 1); // 完全弹性碰撞
      ball.setCollideWorldBounds(true); // 与世界边界碰撞
    }

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数器（用于验证状态）
    this.collisionText = this.add.text(16, 16, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示小球信息
    this.infoText = this.add.text(16, 50, `Balls: ${this.ballCount} | Speed: ${this.ballSpeed}`, {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 添加边界矩形（可视化）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0x00ff00, 1);
    bounds.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保小球速度保持恒定（补偿物理引擎的精度损失）
    this.balls.children.entries.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏离目标速度，进行修正
      if (Math.abs(currentSpeed - this.ballSpeed) > 1) {
        const scale = this.ballSpeed / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

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
  scene: BallScene
};

new Phaser.Game(config);