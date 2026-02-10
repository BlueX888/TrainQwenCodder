class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 可验证状态信号：碰撞计数
    this.ballCount = 5; // 球的数量
    this.ballSpeed = 160; // 球的速度
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('pinkBall', 32, 32);
    graphics.destroy();

    // 创建球组
    this.balls = this.physics.add.group({
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 创建5个球，设置随机位置和速度
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免边缘生成）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.balls.create(x, y, 'pinkBall');
      
      // 设置随机速度方向，但保持速度大小为160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * this.ballSpeed;
      const vy = Math.sin(angle) * this.ballSpeed;
      
      ball.setVelocity(vx, vy);
      ball.setBounce(1); // 确保完全弹性
      ball.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体，更精确
      ball.body.setCircle(16);
    }

    // 添加球与球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 边界可视化（可选，帮助调试）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加计数器
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新显示信息
    this.infoText.setText([
      `Balls: ${this.ballCount}`,
      `Speed: ${this.ballSpeed}`,
      `Collisions: ${this.collisionCount}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 确保球的速度保持恒定（可选，补偿浮点误差）
    this.balls.children.entries.forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过1%，进行修正
      if (Math.abs(currentSpeed - this.ballSpeed) > this.ballSpeed * 0.01) {
        const scale = this.ballSpeed / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
      }
    });
  }
}

// 游戏配置
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
  scene: BallCollisionScene
};

// 启动游戏
new Phaser.Game(config);