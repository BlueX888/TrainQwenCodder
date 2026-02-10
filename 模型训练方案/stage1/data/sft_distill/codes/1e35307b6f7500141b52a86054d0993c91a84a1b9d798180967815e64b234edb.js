class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseSpeed = 300;
    this.averageDistance = 0; // 状态信号：小球平均距离
  }

  preload() {
    // 不需要加载外部资源
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

    // 使用 Graphics 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(15, 15, 15);
    ballGraphics.generateTexture('ball', 30, 30);
    ballGraphics.destroy();

    // 创建5个小球，随机分布在场景中
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0x00ffff];
    
    for (let i = 0; i < 5; i++) {
      // 为每个小球生成不同颜色的纹理
      const colorGraphics = this.add.graphics();
      colorGraphics.fillStyle(colors[i], 1);
      colorGraphics.fillCircle(15, 15, 15);
      colorGraphics.generateTexture(`ball${i}`, 30, 30);
      colorGraphics.destroy();

      // 随机位置（避免太靠近中心）
      const angle = (Math.PI * 2 / 5) * i;
      const distance = 150 + Math.random() * 100;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      // 创建物理精灵
      const ball = this.physics.add.sprite(x, y, `ball${i}`);
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一些初始随机速度
      ball.setVelocity(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );

      this.balls.push(ball);
    }

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, '5个小球受中心黄点引力吸引\n吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      totalDistance += distance;

      // 计算角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算引力大小（与距离成反比）
      // 使用距离的平方反比，并限制最小距离避免除零和过大加速度
      const minDistance = 30;
      const effectiveDistance = Math.max(distance, minDistance);
      
      // 引力强度 = 基准速度 / 距离
      // 这样距离越近，引力越大
      const gravityStrength = this.baseSpeed / effectiveDistance;

      // 计算速度分量
      const vx = Math.cos(angle) * gravityStrength;
      const vy = Math.sin(angle) * gravityStrength;

      // 应用速度（累加到现有速度上，模拟加速度效果）
      // 使用 delta 时间来平滑处理
      const deltaSeconds = delta / 1000;
      ball.setVelocity(
        ball.body.velocity.x + vx * deltaSeconds,
        ball.body.velocity.y + vy * deltaSeconds
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

    // 更新状态信号
    this.averageDistance = totalDistance / this.balls.length;

    // 更新信息显示
    this.infoText.setText([
      `平均距离: ${this.averageDistance.toFixed(1)} px`,
      `基准速度: ${this.baseSpeed}`,
      `小球数量: ${this.balls.length}`,
      `状态: ${this.averageDistance < 100 ? '接近中心' : '远离中心'}`
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
      gravity: { y: 0 }, // 关闭默认重力，使用自定义引力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);