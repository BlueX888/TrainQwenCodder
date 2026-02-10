class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 80; // 吸引速度基准
    this.averageDistance = 0; // 可验证状态信号
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
    ballGraphics.fillStyle(0x00ffff, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 显示中心点（静态显示，不参与物理）
    this.add.image(this.centerX, this.centerY, 'center');

    // 创建12个小球
    for (let i = 0; i < 12; i++) {
      // 随机位置（避免太靠近中心或边缘）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      
      // 设置随机初始速度
      const vx = Phaser.Math.Between(-100, 100);
      const vy = Phaser.Math.Between(-100, 100);
      ball.setVelocity(vx, vy);
      
      // 设置弹性，碰到边界会反弹
      ball.setBounce(1, 1);
      ball.setCollideWorldBounds(true);
      
      // 禁用重力（使用自定义吸引力）
      ball.body.setAllowGravity(false);
      
      this.balls.push(ball);
    }

    // 添加调试信息显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用吸引力
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      totalDistance += distance;

      // 避免除以零，当距离很小时设置最小距离
      const safeDistance = Math.max(distance, 10);

      // 计算吸引力大小（与距离成反比）
      const attractionStrength = this.attractionBase / safeDistance;

      // 计算从小球指向中心的方向向量
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;

      // 归一化方向向量
      const length = Math.sqrt(dx * dx + dy * dy);
      const normalizedDx = dx / length;
      const normalizedDy = dy / length;

      // 计算吸引力产生的速度增量
      const velocityIncrementX = normalizedDx * attractionStrength;
      const velocityIncrementY = normalizedDy * attractionStrength;

      // 应用吸引力到当前速度
      ball.body.velocity.x += velocityIncrementX;
      ball.body.velocity.y += velocityIncrementY;

      // 限制最大速度，避免速度无限增长
      const maxSpeed = 400;
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      if (currentSpeed > maxSpeed) {
        ball.body.velocity.x = (ball.body.velocity.x / currentSpeed) * maxSpeed;
        ball.body.velocity.y = (ball.body.velocity.y / currentSpeed) * maxSpeed;
      }
    });

    // 计算平均距离（可验证状态）
    this.averageDistance = totalDistance / this.balls.length;

    // 更新调试信息
    this.debugText.setText([
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${this.averageDistance.toFixed(2)}`,
      `Attraction Base: ${this.attractionBase}`,
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