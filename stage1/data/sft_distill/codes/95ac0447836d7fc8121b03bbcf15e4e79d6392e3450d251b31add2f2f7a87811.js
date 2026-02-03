class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttraction = 80;
    this.avgDistance = 0; // 状态信号：平均距离
    this.elapsedTime = 0; // 状态信号：运行时间
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('ball', 20, 20);
    graphics.destroy();

    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 8);
    centerGraphics.lineStyle(2, 0xff0000, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 150);

    // 创建10个小球，随机分布在场景中
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i;
      const distance = 150 + Math.random() * 100;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球初始随机速度
      const vx = (Math.random() - 0.5) * 100;
      const vy = (Math.random() - 0.5) * 100;
      ball.setVelocity(vx, vy);
      
      this.balls.push(ball);
    }

    // 小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 560, '绿色小球受红色中心点吸引，吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    this.elapsedTime += delta;
    let totalDistance = 0;

    // 对每个小球应用重力场效果
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );
      
      totalDistance += distance;

      // 计算到中心点的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力（与距离成反比，基准速度80）
      // 为避免距离过小时力过大，设置最小距离为20
      const effectiveDistance = Math.max(distance, 20);
      const attraction = this.baseAttraction / effectiveDistance;

      // 将吸引力分解为x和y方向的速度增量
      const ax = Math.cos(angle) * attraction;
      const ay = Math.sin(angle) * attraction;

      // 应用吸引力到速度
      ball.setVelocity(
        ball.body.velocity.x + ax,
        ball.body.velocity.y + ay
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
    });

    // 计算平均距离
    this.avgDistance = totalDistance / this.balls.length;

    // 更新状态显示
    this.statusText.setText([
      `运行时间: ${(this.elapsedTime / 1000).toFixed(1)}s`,
      `平均距离: ${this.avgDistance.toFixed(1)}px`,
      `小球数量: ${this.balls.length}`
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