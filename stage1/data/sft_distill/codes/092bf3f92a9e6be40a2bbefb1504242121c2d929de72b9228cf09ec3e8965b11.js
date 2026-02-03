class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseSpeed = 240;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xffff00, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);

    // 使用 Graphics 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建 10 个小球，随机分布在场景中
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i;
      const distance = 150 + Math.random() * 150;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球初始随机速度
      const randomAngle = Math.random() * Math.PI * 2;
      const randomSpeed = 50 + Math.random() * 50;
      ball.setVelocity(
        Math.cos(randomAngle) * randomSpeed,
        Math.sin(randomAngle) * randomSpeed
      );

      this.balls.push(ball);
    }

    // 初始化验证信号
    window.__signals__ = {
      frameCount: 0,
      balls: [],
      centerX: this.centerX,
      centerY: this.centerY,
      baseSpeed: this.baseSpeed
    };

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    const ballStates = [];

    // 对每个小球应用引力
    this.balls.forEach((ball, index) => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算引力方向角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 引力与距离成反比，使用基准速度 240
      // 为避免距离过小时引力过大，设置最小距离
      const minDistance = 20;
      const effectiveDistance = Math.max(distance, minDistance);
      
      // 引力大小 = 基准速度 / 距离
      const gravityStrength = this.baseSpeed / effectiveDistance;

      // 计算引力加速度分量
      const gravityX = Math.cos(angle) * gravityStrength;
      const gravityY = Math.sin(angle) * gravityStrength;

      // 应用引力加速度（直接修改速度）
      ball.setVelocity(
        ball.body.velocity.x + gravityX * deltaSeconds,
        ball.body.velocity.y + gravityY * deltaSeconds
      );

      // 限制最大速度，防止速度过快
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

      // 记录小球状态
      ballStates.push({
        index: index,
        x: Math.round(ball.x * 10) / 10,
        y: Math.round(ball.y * 10) / 10,
        velocityX: Math.round(ball.body.velocity.x * 10) / 10,
        velocityY: Math.round(ball.body.velocity.y * 10) / 10,
        distance: Math.round(distance * 10) / 10,
        gravityStrength: Math.round(gravityStrength * 10) / 10
      });
    });

    // 更新验证信号
    window.__signals__.frameCount++;
    window.__signals__.balls = ballStates;
    window.__signals__.timestamp = time;

    // 更新显示信息
    const avgDistance = ballStates.reduce((sum, b) => sum + b.distance, 0) / ballStates.length;
    this.infoText.setText([
      `Frame: ${window.__signals__.frameCount}`,
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${Math.round(avgDistance)}`,
      `Base Speed: ${this.baseSpeed}`,
      `Center: (${this.centerX}, ${this.centerY})`
    ]);

    // 每 60 帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frameCount,
        avgDistance: Math.round(avgDistance),
        ballCount: this.balls.length,
        sampleBall: ballStates[0]
      }));
    }
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