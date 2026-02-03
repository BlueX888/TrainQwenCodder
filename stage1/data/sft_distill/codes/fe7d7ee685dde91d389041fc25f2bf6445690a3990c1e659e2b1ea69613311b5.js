class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 碰撞计数器（可验证状态）
    this.ballCollisionCount = 0; // 小球间碰撞计数（可验证状态）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      defaultKey: 'blueBall',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 添加3个小球并设置随机位置和速度
    const positions = [
      { x: 200, y: 200 },
      { x: 400, y: 300 },
      { x: 600, y: 400 }
    ];

    positions.forEach((pos, index) => {
      const ball = this.balls.create(pos.x, pos.y, 'blueBall');
      ball.setCircle(16); // 设置圆形碰撞体
      
      // 设置随机方向的速度，速度大小为120
      const angle = Phaser.Math.Between(0, 360);
      const velocity = this.physics.velocityFromAngle(angle, 120);
      ball.setVelocity(velocity.x, velocity.y);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 添加边界碰撞监听
    this.balls.children.entries.forEach(ball => {
      ball.body.onWorldBounds = true;
    });

    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界提示
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 0.5);
    border.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    this.ballCollisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Wall Collisions: ${this.collisionCount}`,
      `Ball Collisions: ${this.ballCollisionCount}`,
      `Balls Active: ${this.balls.countActive()}`
    ]);

    // 确保小球速度保持在120左右（考虑浮点误差）
    this.balls.children.entries.forEach(ball => {
      const velocity = ball.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差过大，重新归一化
      if (Math.abs(speed - 120) > 1) {
        const scale = 120 / speed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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