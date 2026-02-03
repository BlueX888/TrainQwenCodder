class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseSpeed = 120;
    this.averageDistance = 0; // 状态信号：平均距离
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xff0000, 0.3);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 150);

    // 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建8个小球
    for (let i = 0; i < 8; i++) {
      // 随机位置（避免太靠近中心）
      const angle = (Math.PI * 2 / 8) * i;
      const distance = Phaser.Math.Between(150, 250);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给予初始切向速度，形成轨道效果
      const tangentAngle = angle + Math.PI / 2;
      ball.setVelocity(
        Math.cos(tangentAngle) * 50,
        Math.sin(tangentAngle) * 50
      );

      this.balls.push(ball);
    }

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, '8个小球受中心红点引力吸引\n引力 = 120 / 距离', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算引力大小（与距离成反比）
      // 防止距离过小导致速度过大
      const safeDistance = Math.max(distance, 20);
      const gravityForce = this.baseSpeed / safeDistance;

      // 计算引力产生的加速度分量
      const ax = Math.cos(angle) * gravityForce;
      const ay = Math.sin(angle) * gravityForce;

      // 应用加速度到速度（使用delta进行时间缩放）
      const deltaSeconds = delta / 1000;
      ball.setVelocity(
        ball.body.velocity.x + ax * deltaSeconds * 60,
        ball.body.velocity.y + ay * deltaSeconds * 60
      );

      // 限制最大速度，防止过快
      const maxSpeed = 300;
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      if (currentSpeed > maxSpeed) {
        const scale = maxSpeed / currentSpeed;
        ball.setVelocity(
          ball.body.velocity.x * scale,
          ball.body.velocity.y * scale
        );
      }

      totalDistance += distance;
    });

    // 计算平均距离（状态信号）
    this.averageDistance = totalDistance / this.balls.length;

    // 更新信息显示
    this.infoText.setText([
      `小球数量: ${this.balls.length}`,
      `平均距离: ${this.averageDistance.toFixed(1)}`,
      `基准引力: ${this.baseSpeed}`,
      `时间: ${(time / 1000).toFixed(1)}s`
    ]);
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
      gravity: { y: 0 }, // 禁用默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);