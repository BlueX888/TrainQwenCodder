class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 3;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 启用世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建球体数组
    this.balls = this.physics.add.group();

    // 创建3个白色小球
    const positions = [
      { x: width * 0.25, y: height * 0.25 },
      { x: width * 0.75, y: height * 0.25 },
      { x: width * 0.5, y: height * 0.75 }
    ];

    const speed = 160;

    positions.forEach((pos, index) => {
      const ball = this.physics.add.sprite(pos.x, pos.y, 'ball');
      
      // 设置完全弹性碰撞（反弹系数为1）
      ball.setBounce(1, 1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机方向的速度，保持速度大小为160
      const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);
      
      // 设置圆形碰撞体（更精确）
      ball.body.setCircle(16);
      
      // 添加到组
      this.balls.add(ball);
    });

    // 添加球体之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  onBallCollision(ball1, ball2) {
    // 碰撞计数器递增
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 160 px/s`
    ]);
  }

  update(time, delta) {
    // 确保球体速度保持在160左右（考虑浮点误差）
    this.balls.getChildren().forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过5%，进行修正
      if (Math.abs(currentSpeed - 160) > 8) {
        const ratio = 160 / currentSpeed;
        body.setVelocity(body.velocity.x * ratio, body.velocity.y * ratio);
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