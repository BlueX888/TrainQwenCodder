class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 碰撞计数器（状态信号）
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ballTexture', 32, 32);
    graphics.destroy();

    // 创建3个小球数组
    this.balls = [];
    const speed = 80;

    // 创建3个小球，设置不同的初始位置
    const positions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 400 }
    ];

    for (let i = 0; i < 3; i++) {
      const ball = this.physics.add.sprite(
        positions[i].x,
        positions[i].y,
        'ballTexture'
      );

      // 设置圆形物理体（更精确的碰撞）
      ball.body.setCircle(16);

      // 设置完全弹性碰撞（弹性系数为1）
      ball.setBounce(1, 1);

      // 启用世界边界碰撞
      ball.setCollideWorldBounds(true);

      // 设置随机速度方向，速度大小为80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);

      this.balls.push(ball);
    }

    // 设置球与球之间的碰撞
    this.physics.add.collider(this.balls[0], this.balls[1], this.onBallCollision, null, this);
    this.physics.add.collider(this.balls[0], this.balls[2], this.onBallCollision, null, this);
    this.physics.add.collider(this.balls[1], this.balls[2], this.onBallCollision, null, this);

    // 显示碰撞计数器（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示说明文字
    this.add.text(10, 40, 'Cyan balls bouncing with speed 80', {
      fontSize: '16px',
      fill: '#00FFFF'
    });

    // 绘制边界框（可视化世界边界）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xFFFFFF, 0.5);
    bounds.strokeRect(0, 0, this.scale.width, this.scale.height);
  }

  onBallCollision(ball1, ball2) {
    // 球体碰撞回调，增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保速度保持在80左右（补偿物理引擎的微小损耗）
    this.balls.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过1%，进行归一化
      if (Math.abs(currentSpeed - 80) > 0.8) {
        const scale = 80 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BallBounceScene
};

// 创建游戏实例
const game = new Phaser.Game(config);