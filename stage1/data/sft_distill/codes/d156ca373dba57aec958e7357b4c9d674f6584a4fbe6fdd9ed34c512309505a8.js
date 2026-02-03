class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseSpeed = 160;
    this.averageDistance = 0; // 状态验证信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 8);
    centerGraphics.lineStyle(2, 0xffff00, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);

    // 使用Graphics生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(12, 12, 12);
    ballGraphics.generateTexture('ball', 24, 24);
    ballGraphics.destroy();

    // 创建8个小球
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const radius = 150 + Math.random() * 100;
      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 设置初始随机速度
      const initialVelocity = 50;
      ball.setVelocity(
        (Math.random() - 0.5) * initialVelocity,
        (Math.random() - 0.5) * initialVelocity
      );

      this.balls.push(ball);
    }

    // 添加显示文本
    this.distanceText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
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

      // 避免除以零，设置最小距离
      const safeDistance = Math.max(distance, 10);

      // 计算引力大小：基准速度 / 距离
      const forceMagnitude = this.baseSpeed / safeDistance;

      // 计算朝向中心的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算引力的速度分量
      const forceX = Math.cos(angle) * forceMagnitude;
      const forceY = Math.sin(angle) * forceMagnitude;

      // 应用引力（加速度方式）
      const deltaSeconds = delta / 1000;
      ball.setVelocity(
        ball.body.velocity.x + forceX * deltaSeconds * 60,
        ball.body.velocity.y + forceY * deltaSeconds * 60
      );

      // 限制最大速度，避免速度过快
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
    });

    // 计算平均距离作为状态验证信号
    this.averageDistance = totalDistance / this.balls.length;

    // 更新显示
    this.distanceText.setText([
      `小球数量: ${this.balls.length}`,
      `平均距离: ${this.averageDistance.toFixed(1)}`,
      `基准速度: ${this.baseSpeed}`,
      `状态: 引力场运行中`
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
      gravity: { y: 0 }, // 关闭默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);