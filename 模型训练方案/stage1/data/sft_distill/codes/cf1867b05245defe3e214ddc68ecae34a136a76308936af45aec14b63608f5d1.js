class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.totalBalls = 10;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 1. 创建灰色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 2. 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 3. 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: this.totalBalls - 1, // 总共10个球
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 4. 设置每个小球的随机位置和速度
    const speed = 360;
    this.balls.children.entries.forEach((ball, index) => {
      // 随机位置（避免重叠）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 随机角度，但保持速度大小为360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);

      // 确保完全弹性碰撞
      ball.setBounce(1, 1);
      ball.setCollideWorldBounds(true);
    });

    // 5. 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 6. 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 7. 添加边界可视化（可选，便于调试）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，用于统计
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Balls: ${this.totalBalls}`,
      `Collisions: ${this.collisionCount}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 验证速度保持（可选，用于调试）
    this.balls.children.entries.forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 由于浮点误差，速度可能略有偏差，这里进行微调
      const targetSpeed = 360;
      if (Math.abs(currentSpeed - targetSpeed) > 1) {
        const scale = targetSpeed / currentSpeed;
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
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false // 设为 true 可查看物理边界
    }
  },
  scene: BallBounceScene
};

// 创建游戏实例
new Phaser.Game(config);