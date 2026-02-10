class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('pinkBall', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.pinkBalls = this.physics.add.group({
      key: 'pinkBall',
      repeat: 4, // 创建5个物体（0-4）
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 为每个物体设置随机位置和速度
    this.pinkBalls.children.iterate((ball) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      ball.setPosition(x, y);

      // 随机方向，固定速度80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      ball.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体（更精确）
      ball.setCircle(20);
    });

    // 设置物体之间的碰撞
    this.physics.add.collider(
      this.pinkBalls, 
      this.pinkBalls,
      this.handleCollision,
      null,
      this
    );

    // 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示物体数量（用于验证）
    this.countText = this.add.text(10, 40, 'Pink Balls: 5', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示平均速度（用于验证）
    this.speedText = this.add.text(10, 70, 'Avg Speed: 80', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  handleCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 计算平均速度用于验证
    let totalSpeed = 0;
    let count = 0;
    
    this.pinkBalls.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      totalSpeed += speed;
      count++;
    });

    if (count > 0) {
      const avgSpeed = Math.round(totalSpeed / count);
      this.speedText.setText('Avg Speed: ' + avgSpeed);
    }
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
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);