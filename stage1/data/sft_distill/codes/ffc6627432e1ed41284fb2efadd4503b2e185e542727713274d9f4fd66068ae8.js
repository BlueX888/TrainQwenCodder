class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 200;
    this.averageDistance = 0; // 可验证状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xff0000, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);

    // 使用 Graphics 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建 20 个小球
    for (let i = 0; i < 20; i++) {
      // 随机位置（避免在中心点）
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(100, 300);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一些初始随机速度
      ball.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
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
    this.add.text(10, 560, '20个小球受中心红点吸引，吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#ffff00'
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

      totalDistance += distance;

      // 避免除以零和距离过小时的过大加速度
      const safeDistance = Math.max(distance, 20);

      // 计算吸引力大小（与距离成反比）
      const attractionForce = this.attractionBase / safeDistance;

      // 计算从小球指向中心点的方向向量
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;

      // 归一化方向向量
      const length = Math.sqrt(dx * dx + dy * dy);
      const normalizedDx = dx / length;
      const normalizedDy = dy / length;

      // 应用吸引力到速度
      const accelerationX = normalizedDx * attractionForce;
      const accelerationY = normalizedDy * attractionForce;

      // 将加速度应用到当前速度（使用 delta 时间进行平滑）
      ball.setVelocity(
        ball.body.velocity.x + accelerationX * (delta / 1000),
        ball.body.velocity.y + accelerationY * (delta / 1000)
      );

      // 限制最大速度，避免小球速度过快
      const maxSpeed = 400;
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
    });

    // 更新平均距离状态信号
    this.averageDistance = Math.round(totalDistance / this.balls.length);

    // 更新信息显示
    this.infoText.setText([
      `小球数量: ${this.balls.length}`,
      `平均距离: ${this.averageDistance}px`,
      `吸引基准: ${this.attractionBase}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 关闭默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);