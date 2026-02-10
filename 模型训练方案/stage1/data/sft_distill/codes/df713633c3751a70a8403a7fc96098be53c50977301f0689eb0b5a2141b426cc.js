class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.ballsCreated = 0; // 状态信号：创建的小球数量
  }

  preload() {
    // 使用 Graphics 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('orangeBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理组
    this.balls = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建20个小球
    const ballCount = 20;
    const speed = 360;
    
    for (let i = 0; i < ballCount; i++) {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 创建小球
      const ball = this.balls.create(x, y, 'orangeBall');
      
      // 设置圆形碰撞体
      ball.setCircle(16);
      ball.body.setCollideWorldBounds(true);
      ball.body.setBounce(1, 1); // 完全弹性碰撞
      
      // 随机方向的速度
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      ball.setVelocity(velocityX, velocityY);
      
      this.ballsCreated++;
    }

    // 启用小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 添加文本显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
    });
  }

  onBallCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Balls: ${this.ballsCreated}`,
      `Collisions: ${this.collisionCount}`,
      `Active: ${this.balls.countActive()}`
    ]);

    // 确保速度恒定（补偿物理引擎的微小误差）
    this.balls.children.entries.forEach(ball => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + 
        ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差超过5%，重新标准化
      if (Math.abs(currentSpeed - 360) > 18) {
        const scale = 360 / currentSpeed;
        ball.body.velocity.x *= scale;
        ball.body.velocity.y *= scale;
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