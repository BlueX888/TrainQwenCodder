class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const BALL_COUNT = 20;
    const BALL_RADIUS = 15;
    const BALL_SPEED = 240;
    const BALL_COLOR = 0xFFA500; // 橙色

    // 使用 Graphics 生成橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(BALL_COLOR, 1);
    graphics.fillCircle(BALL_RADIUS, BALL_RADIUS, BALL_RADIUS);
    graphics.generateTexture('ballTexture', BALL_RADIUS * 2, BALL_RADIUS * 2);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ballTexture',
      repeat: BALL_COUNT - 1,
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 为每个小球设置随机位置和速度
    this.balls.children.iterate((ball) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 生成随机角度，保持速度大小为 240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * BALL_SPEED;
      const vy = Math.sin(angle) * BALL_SPEED;
      ball.setVelocity(vx, vy);

      // 设置圆形碰撞体
      ball.setCircle(BALL_RADIUS);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, null, this);

    // 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示边界提示
    this.add.text(400, 300, 'Elastic Collision Demo\n20 Orange Balls', {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0.7);

    // 绘制边界框（视觉提示）
    const boundaryGraphics = this.add.graphics();
    boundaryGraphics.lineStyle(2, 0xffffff, 0.5);
    boundaryGraphics.strokeRect(0, 0, 800, 600);
  }

  handleBallCollision(ball1, ball2) {
    // 增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 可选：确保速度保持在目标值附近（防止浮点误差累积）
    const TARGET_SPEED = 240;
    const SPEED_TOLERANCE = 10;

    this.balls.children.iterate((ball) => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差过大，重新归一化
      if (Math.abs(currentSpeed - TARGET_SPEED) > SPEED_TOLERANCE) {
        const scale = TARGET_SPEED / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
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
  scene: BallCollisionScene
};

new Phaser.Game(config);