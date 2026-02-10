class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 240;
    this.averageDistance = 0; // 可验证状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建中心点标识（红色圆圈）
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xff0000, 1);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 20);

    // 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00aaff, 1);
    ballGraphics.fillCircle(16, 16, 16);
    ballGraphics.generateTexture('ballTex', 32, 32);
    ballGraphics.destroy();

    // 创建8个小球，随机分布
    const colors = [0x00aaff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800, 0x8800ff, 0xff0088];
    
    for (let i = 0; i < 8; i++) {
      // 为每个小球创建不同颜色的纹理
      const colorGraphics = this.add.graphics();
      colorGraphics.fillStyle(colors[i], 1);
      colorGraphics.fillCircle(16, 16, 16);
      colorGraphics.generateTexture(`ballTex${i}`, 32, 32);
      colorGraphics.destroy();

      // 在中心周围随机位置创建小球
      const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
      const distance = 150 + Math.random() * 150;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, `ballTex${i}`);
      ball.setCollideWorldBounds(false); // 允许小球移出边界后继续受引力
      ball.setDamping(true);
      ball.setDrag(0.1); // 添加轻微阻力，使运动更平滑
      
      // 给小球初始随机速度
      const initialVelocity = 50;
      ball.setVelocity(
        (Math.random() - 0.5) * initialVelocity,
        (Math.random() - 0.5) * initialVelocity
      );

      this.balls.push(ball);
    }

    // 添加调试信息文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用引力
    this.balls.forEach((ball) => {
      // 计算小球到中心的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      totalDistance += distance;

      // 避免除以零，距离太近时使用最小值
      const effectiveDistance = Math.max(distance, 10);

      // 计算吸引力速度：速度 = 基准速度 / 距离
      const attractionSpeed = this.attractionBase / effectiveDistance;

      // 计算从小球指向中心的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力的速度分量
      const velocityX = Math.cos(angle) * attractionSpeed;
      const velocityY = Math.sin(angle) * attractionSpeed;

      // 将吸引力加到当前速度上（使用加速度效果）
      const currentVelocity = ball.body.velocity;
      ball.setVelocity(
        currentVelocity.x + velocityX * (delta / 1000),
        currentVelocity.y + velocityY * (delta / 1000)
      );

      // 限制最大速度，避免小球过快
      const maxSpeed = 400;
      const currentSpeed = Math.sqrt(
        currentVelocity.x ** 2 + currentVelocity.y ** 2
      );
      if (currentSpeed > maxSpeed) {
        const scale = maxSpeed / currentSpeed;
        ball.setVelocity(
          currentVelocity.x * scale,
          currentVelocity.y * scale
        );
      }
    });

    // 计算平均距离作为状态信号
    this.averageDistance = totalDistance / this.balls.length;

    // 更新调试信息
    this.debugText.setText([
      `Average Distance: ${this.averageDistance.toFixed(2)}`,
      `Attraction Base: ${this.attractionBase}`,
      `Active Balls: ${this.balls.length}`
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