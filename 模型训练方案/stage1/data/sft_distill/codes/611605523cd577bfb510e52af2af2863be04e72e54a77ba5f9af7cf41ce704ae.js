class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 240; // 吸引速度基准
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
    centerGraphics.strokeCircle(this.centerX, this.centerY, 150);

    // 使用 Graphics 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建 10 个小球，随机分布在场景中
    for (let i = 0; i < 10; i++) {
      // 随机位置，避免太靠近中心
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.FloatBetween(100, 250);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一些初始速度，形成轨道效果
      const perpAngle = angle + Math.PI / 2;
      const initialSpeed = Phaser.Math.FloatBetween(30, 60);
      ball.setVelocity(
        Math.cos(perpAngle) * initialSpeed,
        Math.sin(perpAngle) * initialSpeed
      );

      this.balls.push(ball);
    }

    // 添加文本显示信息
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 初始化信号对象
    window.__signals__ = {
      frameCount: 0,
      balls: [],
      centerX: this.centerX,
      centerY: this.centerY,
      attractionBase: this.attractionBase
    };
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    const ballsData = [];

    // 对每个小球应用重力场吸引力
    this.balls.forEach((ball, index) => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 防止除零和过强的吸引力
      const safeDist = Math.max(distance, 20);

      // 计算吸引力大小：基准速度 / 距离
      const attractionForce = this.attractionBase / safeDist;

      // 计算从小球指向中心的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力在 x 和 y 方向的分量
      const forceX = Math.cos(angle) * attractionForce;
      const forceY = Math.sin(angle) * attractionForce;

      // 应用速度变化（加速度效果）
      ball.setVelocity(
        ball.body.velocity.x + forceX * deltaSeconds * 60,
        ball.body.velocity.y + forceY * deltaSeconds * 60
      );

      // 限制最大速度，防止速度过快
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      const maxSpeed = 300;
      if (currentSpeed > maxSpeed) {
        const scale = maxSpeed / currentSpeed;
        ball.setVelocity(
          ball.body.velocity.x * scale,
          ball.body.velocity.y * scale
        );
      }

      // 收集小球数据
      ballsData.push({
        id: index,
        x: Math.round(ball.x * 10) / 10,
        y: Math.round(ball.y * 10) / 10,
        vx: Math.round(ball.body.velocity.x * 10) / 10,
        vy: Math.round(ball.body.velocity.y * 10) / 10,
        distance: Math.round(distance * 10) / 10,
        attractionForce: Math.round(attractionForce * 10) / 10
      });
    });

    // 更新信息显示
    const avgDistance = ballsData.reduce((sum, b) => sum + b.distance, 0) / ballsData.length;
    this.infoText.setText([
      `Frame: ${window.__signals__.frameCount}`,
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${Math.round(avgDistance)}`,
      `Attraction Base: ${this.attractionBase}`,
      `Center: (${this.centerX}, ${this.centerY})`
    ]);

    // 更新信号数据
    window.__signals__.frameCount++;
    window.__signals__.balls = ballsData;
    window.__signals__.avgDistance = Math.round(avgDistance * 10) / 10;

    // 每 60 帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frameCount,
        avgDistance: window.__signals__.avgDistance,
        ballCount: ballsData.length,
        sampleBall: ballsData[0]
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
      gravity: { y: 0 }, // 禁用默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);