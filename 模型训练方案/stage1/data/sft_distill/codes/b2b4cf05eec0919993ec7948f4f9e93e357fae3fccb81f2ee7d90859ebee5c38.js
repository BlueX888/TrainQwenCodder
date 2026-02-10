class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.activeBalls = 0; // 状态信号：活跃小球数量
    this.totalPulls = 0; // 状态信号：总引力计算次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;
    const baseSpeed = 160; // 吸引速度基准
    
    // 创建小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x3498db, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('ball', 20, 20);
    graphics.destroy();

    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xe74c3c, 1);
    centerGraphics.fillCircle(centerX, centerY, 8);
    centerGraphics.lineStyle(2, 0xe74c3c, 0.5);
    centerGraphics.strokeCircle(centerX, centerY, 15);

    // 创建10个小球
    this.balls = [];
    for (let i = 0; i < 10; i++) {
      // 随机位置（避开中心区域）
      let x, y;
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
      } while (Phaser.Math.Distance.Between(x, y, centerX, centerY) < 100);

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 设置随机初始速度
      ball.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );

      this.balls.push(ball);
    }

    this.activeBalls = this.balls.length;

    // 存储中心点坐标
    this.centerPoint = { x: centerX, y: centerY };
    this.baseSpeed = baseSpeed;

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, '10个小球受中心红点吸引，吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    this.activeBalls = 0;

    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x,
        ball.y,
        this.centerPoint.x,
        this.centerPoint.y
      );

      // 只对距离大于最小阈值的小球应用引力
      if (distance > 20) {
        this.activeBalls++;

        // 计算角度
        const angle = Phaser.Math.Angle.Between(
          ball.x,
          ball.y,
          this.centerPoint.x,
          this.centerPoint.y
        );

        // 计算吸引力（与距离成反比）
        // F = baseSpeed / distance
        const force = this.baseSpeed / distance;

        // 将力转换为速度分量
        const forceX = Math.cos(angle) * force;
        const forceY = Math.sin(angle) * force;

        // 应用加速度（累加到当前速度）
        ball.setVelocity(
          ball.body.velocity.x + forceX * deltaSeconds * 60,
          ball.body.velocity.y + forceY * deltaSeconds * 60
        );

        // 限制最大速度，防止过快
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

        this.totalPulls++;
      }
    });

    // 更新信息显示
    this.infoText.setText([
      `活跃小球: ${this.activeBalls}/10`,
      `总引力计算: ${this.totalPulls}`,
      `吸引基准速度: ${this.baseSpeed}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 关闭默认重力
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);