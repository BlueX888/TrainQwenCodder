class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.gravityBase = 160;
    this.averageDistance = 0; // 状态信号：平均距离
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 8);
    centerGraphics.lineStyle(2, 0xffff00, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);

    // 生成小球纹理
    this.createBallTextures();

    // 创建3个小球
    const colors = ['ball_red', 'ball_green', 'ball_blue'];
    const positions = [
      { x: 200, y: 150, vx: 50, vy: 80 },
      { x: 600, y: 200, vx: -60, vy: 40 },
      { x: 400, y: 500, vx: 30, vy: -70 }
    ];

    for (let i = 0; i < 3; i++) {
      const ball = this.physics.add.sprite(
        positions[i].x,
        positions[i].y,
        colors[i]
      );
      
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setVelocity(positions[i].vx, positions[i].vy);
      ball.setDamping(false);
      
      this.balls.push(ball);
    }

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  createBallTextures() {
    const colors = [
      { key: 'ball_red', color: 0xff0000 },
      { key: 'ball_green', color: 0x00ff00 },
      { key: 'ball_blue', color: 0x0099ff }
    ];

    colors.forEach(({ key, color }) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.fillCircle(16, 16, 16);
      
      // 添加高光效果
      graphics.fillStyle(0xffffff, 0.3);
      graphics.fillCircle(12, 12, 6);
      
      graphics.generateTexture(key, 32, 32);
      graphics.destroy();
    });
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    let totalDistance = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x,
        ball.y,
        this.centerX,
        this.centerY
      );

      totalDistance += distance;

      // 防止距离过小导致引力过大
      const safeDistance = Math.max(distance, 20);

      // 计算引力大小（与距离成反比）
      const gravityStrength = this.gravityBase / safeDistance;

      // 计算从小球指向中心的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x,
        ball.y,
        this.centerX,
        this.centerY
      );

      // 计算引力在x和y方向的分量
      const gravityX = Math.cos(angle) * gravityStrength;
      const gravityY = Math.sin(angle) * gravityStrength;

      // 应用引力到速度（使用加速度方式）
      ball.setVelocity(
        ball.body.velocity.x + gravityX * deltaSeconds * 60,
        ball.body.velocity.y + gravityY * deltaSeconds * 60
      );

      // 限制最大速度，防止速度过大
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

    // 更新状态信号
    this.averageDistance = totalDistance / this.balls.length;

    // 更新信息显示
    this.infoText.setText([
      `Gravity Base: ${this.gravityBase}`,
      `Average Distance: ${this.averageDistance.toFixed(1)}`,
      `Ball 1: (${Math.round(this.balls[0].x)}, ${Math.round(this.balls[0].y)})`,
      `Ball 2: (${Math.round(this.balls[1].x)}, ${Math.round(this.balls[1].y)})`,
      `Ball 3: (${Math.round(this.balls[2].x)}, ${Math.round(this.balls[2].y)})`
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
  scene: GravityScene
};

new Phaser.Game(config);