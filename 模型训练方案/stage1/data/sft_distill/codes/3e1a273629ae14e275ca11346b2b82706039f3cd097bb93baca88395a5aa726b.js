class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 80;
    this.averageSpeed = 0; // 状态信号：小球平均速度
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建中心点纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(0, 0, 15);
    centerGraphics.generateTexture('center', 30, 30);
    centerGraphics.destroy();

    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ffff, 1);
    ballGraphics.fillCircle(0, 0, 10);
    ballGraphics.generateTexture('ball', 20, 20);
    ballGraphics.destroy();

    // 显示中心点
    this.centerPoint = this.add.image(this.centerX, this.centerY, 'center');

    // 创建3个小球
    const positions = [
      { x: 200, y: 150, vx: 50, vy: 30 },
      { x: 600, y: 200, vx: -40, vy: 50 },
      { x: 300, y: 450, vx: 60, vy: -20 }
    ];

    positions.forEach(pos => {
      const ball = this.physics.add.sprite(pos.x, pos.y, 'ball');
      ball.setVelocity(pos.vx, pos.vy);
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      this.balls.push(ball);
    });

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, '重力场效果：3个小球受中心点吸引', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    let totalSpeed = 0;

    // 对每个小球应用重力场效果
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 避免除零和距离过近时力过大
      const safeDist = Math.max(distance, 50);

      // 计算吸引力强度（与距离成反比）
      const force = this.attractionBase / safeDist;

      // 计算吸引方向的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 将吸引力分解为 x 和 y 方向的加速度
      const forceX = Math.cos(angle) * force * 60; // 乘以60转换为每秒的加速度
      const forceY = Math.sin(angle) * force * 60;

      // 应用加速度到速度
      ball.setVelocity(
        ball.body.velocity.x + forceX * (delta / 1000),
        ball.body.velocity.y + forceY * (delta / 1000)
      );

      // 限制最大速度，避免速度过快
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

      totalSpeed += currentSpeed;
    });

    // 计算平均速度作为状态信号
    this.averageSpeed = totalSpeed / this.balls.length;

    // 更新信息显示
    this.infoText.setText([
      `小球数量: ${this.balls.length}`,
      `平均速度: ${this.averageSpeed.toFixed(2)}`,
      `吸引力基准: ${this.attractionBase}`,
      `小球1位置: (${Math.round(this.balls[0].x)}, ${Math.round(this.balls[0].y)})`,
      `小球1速度: ${Math.round(Math.sqrt(this.balls[0].body.velocity.x ** 2 + this.balls[0].body.velocity.y ** 2))}`
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