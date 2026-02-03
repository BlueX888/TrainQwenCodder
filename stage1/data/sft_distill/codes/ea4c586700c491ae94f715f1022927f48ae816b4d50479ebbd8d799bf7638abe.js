class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 可验证状态：碰撞计数
    this.balls = null;
  }

  preload() {
    // 使用 Graphics 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('greenBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建小球组
    this.balls = this.physics.add.group();

    // 创建 3 个绿色小球
    const positions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 400 }
    ];

    positions.forEach((pos, index) => {
      const ball = this.physics.add.sprite(pos.x, pos.y, 'greenBall');
      
      // 设置碰撞边界反弹
      ball.setCollideWorldBounds(true);
      ball.setBounce(1); // 完全弹性碰撞
      
      // 设置随机方向的速度，速率为 240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * 240;
      const vy = Math.sin(angle) * 240;
      ball.setVelocity(vx, vy);
      
      // 添加到组
      this.balls.add(ball);
    });

    // 设置小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 添加调试文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调：增加碰撞计数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新碰撞计数显示
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 确保小球速度保持在 240（修正浮点误差）
    this.balls.getChildren().forEach(ball => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      if (Math.abs(speed - 240) > 1) {
        const scale = 240 / speed;
        ball.setVelocity(ball.body.velocity.x * scale, ball.body.velocity.y * scale);
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