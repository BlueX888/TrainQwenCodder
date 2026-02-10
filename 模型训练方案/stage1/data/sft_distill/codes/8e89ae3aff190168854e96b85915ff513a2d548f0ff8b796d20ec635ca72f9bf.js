class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttraction = 80;
    
    // 状态信号
    this.averageSpeed = 0;
    this.averageDistance = 0;
    this.frameCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(16, 16, 16);
    centerGraphics.generateTexture('center', 32, 32);
    centerGraphics.destroy();

    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(10, 10, 10);
    ballGraphics.generateTexture('ball', 20, 20);
    ballGraphics.destroy();

    // 显示中心点
    this.centerPoint = this.add.sprite(this.centerX, this.centerY, 'center');
    this.centerPoint.setDepth(10);

    // 创建3个小球
    const ballPositions = [
      { x: 200, y: 150, vx: 50, vy: 30 },
      { x: 600, y: 200, vx: -40, vy: 50 },
      { x: 400, y: 500, vx: 30, vy: -60 }
    ];

    for (let i = 0; i < 3; i++) {
      const pos = ballPositions[i];
      const ball = this.physics.add.sprite(pos.x, pos.y, 'ball');
      ball.setVelocity(pos.vx, pos.vy);
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(false);
      ball.setDrag(0);
      this.balls.push(ball);
    }

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    this.debugText.setDepth(100);

    // 绘制边界
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0x666666, 1);
    bounds.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    this.frameCount++;
    
    let totalSpeed = 0;
    let totalDistance = 0;

    // 对每个小球应用引力
    this.balls.forEach((ball, index) => {
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

      // 计算吸引力（与距离成反比）
      // 防止距离过小导致吸引力过大
      const safeDistance = Math.max(distance, 50);
      const attractionForce = this.baseAttraction / safeDistance;

      // 计算加速度分量
      const ax = Math.cos(angle) * attractionForce * 60; // 乘以60转换为每秒
      const ay = Math.sin(angle) * attractionForce * 60;

      // 应用加速度到速度
      const deltaSeconds = delta / 1000;
      ball.setVelocity(
        ball.body.velocity.x + ax * deltaSeconds,
        ball.body.velocity.y + ay * deltaSeconds
      );

      // 限制最大速度
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

      // 统计数据
      totalSpeed += currentSpeed;
      totalDistance += distance;

      // 绘制吸引力线（可选，用于可视化）
      if (this.attractionLines) {
        this.attractionLines.destroy();
      }
    });

    // 绘制吸引力线
    this.attractionLines = this.add.graphics();
    this.attractionLines.lineStyle(1, 0xff00ff, 0.3);
    this.balls.forEach(ball => {
      this.attractionLines.lineBetween(
        ball.x, ball.y,
        this.centerX, this.centerY
      );
    });

    // 更新状态信号
    this.averageSpeed = totalSpeed / this.balls.length;
    this.averageDistance = totalDistance / this.balls.length;

    // 更新调试信息
    this.debugText.setText([
      `Frame: ${this.frameCount}`,
      `Avg Speed: ${this.averageSpeed.toFixed(2)} px/s`,
      `Avg Distance: ${this.averageDistance.toFixed(2)} px`,
      `Base Attraction: ${this.baseAttraction}`,
      `Balls: ${this.balls.length}`,
      `Ball 1: (${this.balls[0].x.toFixed(0)}, ${this.balls[0].y.toFixed(0)})`,
      `Ball 2: (${this.balls[1].x.toFixed(0)}, ${this.balls[1].y.toFixed(0)})`,
      `Ball 3: (${this.balls[2].x.toFixed(0)}, ${this.balls[2].y.toFixed(0)})`
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);