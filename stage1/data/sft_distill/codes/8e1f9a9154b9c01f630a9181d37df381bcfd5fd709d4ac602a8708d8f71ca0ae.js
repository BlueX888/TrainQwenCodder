class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号：碰撞次数
    this.ballCount = 3; // 小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();

    // 创建小球组
    this.balls = this.physics.add.group();

    // 创建3个小球，设置随机位置和速度
    const speed = 80;
    const positions = [
      { x: 200, y: 200 },
      { x: 400, y: 300 },
      { x: 600, y: 400 }
    ];

    for (let i = 0; i < this.ballCount; i++) {
      const ball = this.balls.create(
        positions[i].x,
        positions[i].y,
        'blueBall'
      );

      // 设置物理属性
      ball.setBounce(1, 1); // 完全弹性碰撞
      ball.setCollideWorldBounds(true); // 与世界边界碰撞

      // 设置随机速度方向
      const angle = Phaser.Math.Between(0, 360);
      const vx = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
      const vy = Math.sin(Phaser.Math.DegToRad(angle)) * speed;
      ball.setVelocity(vx, vy);

      // 设置圆形碰撞体
      ball.setCircle(16);
    }

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数器
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示小球速度信息（用于调试验证）
    this.speedText = this.add.text(10, 40, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 绘制边界参考线
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 0.5);
    border.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调函数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 更新速度显示（可选，用于验证小球在移动）
    if (this.balls && this.balls.getChildren().length > 0) {
      const ball = this.balls.getChildren()[0];
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      this.speedText.setText('Ball Speed: ' + speed.toFixed(2));
    }

    // 确保小球速度保持恒定（补偿浮点误差）
    this.balls.getChildren().forEach(ball => {
      const currentSpeed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      if (Math.abs(currentSpeed - 80) > 0.1) {
        const factor = 80 / currentSpeed;
        ball.setVelocity(ball.body.velocity.x * factor, ball.body.velocity.y * factor);
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