class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 状态信号：记录碰撞次数
    this.activeBalls = 0; // 状态信号：活跃小球数量
  }

  preload() {
    // 使用 Graphics 创建蓝色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(15, 15, 15);
    graphics.generateTexture('blueBall', 30, 30);
    graphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.ballsGroup = this.physics.add.group({
      key: 'blueBall',
      repeat: 19, // 创建20个小球（0-19）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的随机位置和速度
    const balls = this.ballsGroup.getChildren();
    this.activeBalls = balls.length;

    balls.forEach((ball, index) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 设置随机方向的速度，总速度为160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 160;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);

      // 设置完全弹性碰撞
      ball.setBounce(1, 1);
      ball.setCollideWorldBounds(true);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.ballsGroup, this.ballsGroup, this.handleCollision, null, this);

    // 添加调试文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界指示
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeRect(0, 0, 800, 600);
  }

  handleCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    const balls = this.ballsGroup.getChildren();
    let totalSpeed = 0;
    let avgSpeed = 0;

    balls.forEach(ball => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      totalSpeed += speed;
    });

    avgSpeed = totalSpeed / balls.length;

    this.statusText.setText([
      `Active Balls: ${this.activeBalls}`,
      `Total Collisions: ${this.collisionCount}`,
      `Avg Speed: ${avgSpeed.toFixed(2)}`,
      `Target Speed: 160`
    ]);

    // 修正速度衰减（确保速度保持在160左右）
    balls.forEach(ball => {
      const currentSpeed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      
      // 如果速度偏离目标速度160，进行微调
      if (Math.abs(currentSpeed - 160) > 5) {
        const ratio = 160 / currentSpeed;
        ball.setVelocity(
          ball.body.velocity.x * ratio,
          ball.body.velocity.y * ratio
        );
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BallBounceScene
};

// 启动游戏
const game = new Phaser.Game(config);