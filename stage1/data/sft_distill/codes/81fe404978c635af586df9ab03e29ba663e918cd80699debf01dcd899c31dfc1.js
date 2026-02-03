class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 12;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 添加 12 个小球
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.balls.create(x, y, 'ball');
      
      // 设置随机速度方向，总速度约为 300
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 300;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      ball.setVelocity(vx, vy);
      ball.setBounce(1, 1); // 完全弹性碰撞
      ball.setCollideWorldBounds(true);
    }

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示小球数量
    this.ballCountText = this.add.text(10, 40, `Balls: ${this.ballCount}`, {
      fontSize: '24px',
      fill: '#00ffff'
    });

    // 显示平均速度（用于验证）
    this.speedText = this.add.text(10, 70, 'Avg Speed: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
  }

  onBallCollision(ball1, ball2) {
    // 碰撞计数器递增
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新碰撞计数显示
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 计算平均速度（用于验证小球保持约300的速度）
    let totalSpeed = 0;
    let ballsArray = this.balls.getChildren();
    
    ballsArray.forEach(ball => {
      const velocity = ball.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      totalSpeed += speed;
    });

    const avgSpeed = totalSpeed / this.ballCount;
    this.speedText.setText(`Avg Speed: ${avgSpeed.toFixed(1)}`);
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
  scene: GameScene
};

new Phaser.Game(config);