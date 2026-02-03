class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttraction = 240;
    this.averageDistance = 0; // 状态信号：小球平均距离
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
    centerGraphics.strokeCircle(this.centerX, this.centerY, 150);

    // 使用 Graphics 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00aaff, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建15个小球，随机分布在场景中
    for (let i = 0; i < 15; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(100, 250);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球初始随机速度
      ball.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      
      this.balls.push(ball);
    }

    // 添加信息文本显示状态
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用向中心的吸引力
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );
      
      totalDistance += distance;

      // 防止除以零或距离过小导致速度过大
      if (distance < 5) return;

      // 计算吸引力方向的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力大小（与距离成反比）
      // 吸引速度 = baseAttraction / distance
      const attractionSpeed = this.baseAttraction / distance;

      // 将吸引力转换为速度分量（使用 delta 来保证帧率独立）
      const deltaSeconds = delta / 1000;
      const velocityX = Math.cos(angle) * attractionSpeed * deltaSeconds * 60;
      const velocityY = Math.sin(angle) * attractionSpeed * deltaSeconds * 60;

      // 应用吸引力到当前速度
      ball.setVelocity(
        ball.body.velocity.x + velocityX,
        ball.body.velocity.y + velocityY
      );

      // 限制最大速度，防止速度过大
      const maxSpeed = 400;
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      if (currentSpeed > maxSpeed) {
        ball.setVelocity(
          (ball.body.velocity.x / currentSpeed) * maxSpeed,
          (ball.body.velocity.y / currentSpeed) * maxSpeed
        );
      }
    });

    // 更新状态信号
    this.averageDistance = totalDistance / this.balls.length;

    // 更新信息显示
    this.infoText.setText([
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${this.averageDistance.toFixed(1)}`,
      `Base Attraction: ${this.baseAttraction}`,
      `Center: (${this.centerX}, ${this.centerY})`
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