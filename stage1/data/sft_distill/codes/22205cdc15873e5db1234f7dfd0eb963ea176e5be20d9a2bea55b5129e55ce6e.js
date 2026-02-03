class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号：碰撞计数
    this.ballCount = 20; // 小球数量
    this.ballSpeed = 240; // 小球速度
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'yellowBall',
      repeat: this.ballCount - 1, // 创建20个小球
      bounceX: 1, // X轴完全弹性碰撞
      bounceY: 1, // Y轴完全弹性碰撞
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 为每个小球设置随机位置和速度
    this.balls.children.iterate((ball) => {
      // 随机位置（避免在边缘生成）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 随机方向，固定速度240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * this.ballSpeed;
      const vy = Math.sin(angle) * this.ballSpeed;
      ball.setVelocity(vx, vy);

      // 确保弹性系数为1（完全弹性碰撞）
      ball.setBounce(1);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

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

    this.updateStatus();
  }

  update(time, delta) {
    // 确保小球速度保持恒定（补偿物理引擎的微小误差）
    this.balls.children.iterate((ball) => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过5%，重新归一化
      if (Math.abs(currentSpeed - this.ballSpeed) > this.ballSpeed * 0.05) {
        const scale = this.ballSpeed / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
      }
    });

    this.updateStatus();
  }

  onBallCollision(ball1, ball2) {
    // 碰撞计数增加
    this.collisionCount++;
  }

  updateStatus() {
    // 更新状态显示
    this.statusText.setText([
      `小球数量: ${this.ballCount}`,
      `目标速度: ${this.ballSpeed}`,
      `碰撞次数: ${this.collisionCount}`,
      `运行时间: ${Math.floor(this.time.now / 1000)}s`
    ]);
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
      debug: false // 设置为 true 可查看物理边界
    }
  },
  scene: GameScene
};

new Phaser.Game(config);