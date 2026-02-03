class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号：碰撞计数
    this.ballCount = 3; // 球的数量
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组来管理球体
    this.balls = this.physics.add.group({
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 创建3个球体并设置随机速度
    const speed = 80;
    const positions = [
      { x: width * 0.25, y: height * 0.25 },
      { x: width * 0.75, y: height * 0.25 },
      { x: width * 0.5, y: height * 0.75 }
    ];

    positions.forEach((pos, index) => {
      const ball = this.balls.create(pos.x, pos.y, 'ball');
      
      // 设置随机速度方向，保持速度大小为80
      const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      ball.setVelocity(vx, vy);
      ball.setCircle(16); // 设置圆形碰撞体
      ball.name = `ball_${index}`; // 便于调试
    });

    // 设置球体之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加边界碰撞监听（可选，用于计数）
    this.balls.children.entries.forEach(ball => {
      ball.body.onWorldBounds = true;
    });

    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
      this.updateStatusText();
    });
  }

  onBallCollision(ball1, ball2) {
    // 球体碰撞回调
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 80 px/s`
    ]);
  }

  update(time, delta) {
    // 可选：确保速度保持恒定（防止浮点误差累积）
    this.balls.children.entries.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏离80太多，进行修正
      if (Math.abs(currentSpeed - 80) > 1) {
        const scale = 80 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
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
      debug: false // 设为 true 可查看碰撞体
    }
  },
  scene: GameScene
};

new Phaser.Game(config);