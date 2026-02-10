class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerPoint = null;
    this.averageDistance = 0; // 可验证的状态信号
    this.attractionBase = 80; // 吸引速度基准
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // 创建中心点纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(0, 0, 15);
    centerGraphics.generateTexture('centerTex', 30, 30);
    centerGraphics.destroy();

    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ffff, 1);
    ballGraphics.fillCircle(0, 0, 10);
    ballGraphics.generateTexture('ballTex', 20, 20);
    ballGraphics.destroy();

    // 创建中心点（非物理对象）
    this.centerPoint = this.add.sprite(centerX, centerY, 'centerTex');
    this.centerPoint.setDepth(1);

    // 添加中心点标签
    this.add.text(centerX, centerY - 40, 'Gravity Center', {
      fontSize: '14px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 创建8个小球
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 200 + Math.random() * 100;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const ball = this.physics.add.sprite(x, y, 'ballTex');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 设置初始随机速度
      const initialSpeed = 50;
      ball.setVelocity(
        (Math.random() - 0.5) * initialSpeed,
        (Math.random() - 0.5) * initialSpeed
      );

      this.balls.push(ball);
    }

    // 添加小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, height - 60, 'Gravity Field Simulation', {
      fontSize: '18px',
      color: '#ffff00'
    });
    this.add.text(10, height - 35, '8 balls attracted to center point', {
      fontSize: '14px',
      color: '#ffffff'
    });
  }

  update(time, delta) {
    if (!this.centerPoint || this.balls.length === 0) return;

    const centerX = this.centerPoint.x;
    const centerY = this.centerPoint.y;
    let totalDistance = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        centerX, centerY
      );

      totalDistance += distance;

      // 避免除零和过近时的极大加速度
      const safeDistance = Math.max(distance, 20);

      // 计算吸引力：速度基准 / 距离
      const attractionForce = this.attractionBase / safeDistance;

      // 计算朝向中心点的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        centerX, centerY
      );

      // 计算吸引力产生的速度分量
      const vx = Math.cos(angle) * attractionForce * 60 * (delta / 1000);
      const vy = Math.sin(angle) * attractionForce * 60 * (delta / 1000);

      // 应用吸引力（累加到当前速度）
      ball.setVelocity(
        ball.body.velocity.x + vx,
        ball.body.velocity.y + vy
      );

      // 限制最大速度，避免过快
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

    // 更新平均距离（状态信号）
    this.averageDistance = totalDistance / this.balls.length;

    // 更新状态显示
    this.statusText.setText([
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${this.averageDistance.toFixed(1)}`,
      `Attraction Base: ${this.attractionBase}`
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