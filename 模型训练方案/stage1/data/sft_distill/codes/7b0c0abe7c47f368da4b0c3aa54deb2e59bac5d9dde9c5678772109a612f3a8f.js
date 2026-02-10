class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCollisions = 0; // 小球间碰撞次数
    this.wallCollisions = 0; // 墙壁碰撞次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('ball', 40, 40);
    graphics.destroy();

    // 创建小球组
    this.balls = this.physics.add.group();

    // 创建3个小球并设置随机速度
    const speed = 360;
    const positions = [
      { x: 200, y: 200 },
      { x: 400, y: 300 },
      { x: 600, y: 400 }
    ];

    for (let i = 0; i < 3; i++) {
      const ball = this.balls.create(positions[i].x, positions[i].y, 'ball');
      
      // 设置物理属性
      ball.setCircle(20); // 设置碰撞体为圆形，半径20
      ball.setBounce(1); // 完全弹性碰撞
      ball.setCollideWorldBounds(true); // 与世界边界碰撞
      
      // 设置随机方向的速度，总速度为360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);
    }

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', (body) => {
      this.wallCollisions++;
      this.updateStatusText();
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 绘制边界框（可视化）
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xFFFFFF, 1);
    borderGraphics.strokeRect(0, 0, 800, 600);

    // 添加说明文本
    this.add.text(10, 560, '青色小球以360速度移动，碰撞边界和彼此时弹开', {
      fontSize: '16px',
      fill: '#00FFFF'
    });
  }

  onBallCollision(ball1, ball2) {
    this.ballCollisions++;
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `总碰撞次数: ${this.collisionCount}`,
      `小球碰撞: ${this.ballCollisions}`,
      `墙壁碰撞: ${this.wallCollisions}`
    ]);
  }

  update(time, delta) {
    // 确保小球速度保持在360左右（由于浮点误差可能有微小变化）
    this.balls.children.entries.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过5%，重新归一化
      if (Math.abs(currentSpeed - 360) > 18) {
        const scale = 360 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

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
  scene: BallCollisionScene
};

new Phaser.Game(config);