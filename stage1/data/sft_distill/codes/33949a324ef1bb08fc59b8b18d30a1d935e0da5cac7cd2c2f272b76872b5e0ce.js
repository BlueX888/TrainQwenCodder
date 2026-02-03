class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 可验证状态：碰撞计数
    this.ballCount = 20; // 可验证状态：小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('orangeBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 生成20个小球
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.balls.create(x, y, 'orangeBall');
      
      // 设置随机方向的360速度
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 360;
      const velocityY = Math.sin(angle) * 360;
      
      ball.setVelocity(velocityX, velocityY);
      ball.setBounce(1, 1); // 完全弹性碰撞
      ball.setCollideWorldBounds(true);
    }

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加边界可视化
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 1);
    bounds.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞计数
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Ball Count: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 360 px/s`
    ]);
  }

  update(time, delta) {
    // 验证小球速度保持在360左右（考虑浮点误差）
    this.balls.children.entries.forEach(ball => {
      const body = ball.body;
      const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏离360太多，重新归一化（处理累积误差）
      if (Math.abs(speed - 360) > 10) {
        const scale = 360 / speed;
        body.velocity.x *= scale;
        body.velocity.y *= scale;
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