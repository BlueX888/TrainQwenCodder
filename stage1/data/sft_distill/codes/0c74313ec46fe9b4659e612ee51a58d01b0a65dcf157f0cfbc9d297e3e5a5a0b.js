class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseSpeed = 240;
    this.averageDistance = 0; // 可验证状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 8);
    centerGraphics.lineStyle(2, 0xff0000, 0.3);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 150);

    // 使用 Graphics 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(12, 12, 12);
    ballGraphics.generateTexture('ball', 24, 24);
    ballGraphics.destroy();

    // 创建 8 个小球，均匀分布在圆周上
    const radius = 200;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius;
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(false);
      ball.setDamping(false);
      ball.setDrag(0);
      
      // 给小球一个初始切向速度，形成轨道效果
      const tangentAngle = angle + Math.PI / 2;
      ball.setVelocity(
        Math.cos(tangentAngle) * 60,
        Math.sin(tangentAngle) * 60
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
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用向心引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      totalDistance += distance;

      // 防止距离过小导致力过大
      const safeDist = Math.max(distance, 10);

      // 计算吸引力大小：基准速度 / 距离
      const attractionForce = this.baseSpeed / safeDist;

      // 计算从小球指向中心的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力在 x 和 y 方向的分量
      const forceX = Math.cos(angle) * attractionForce;
      const forceY = Math.sin(angle) * attractionForce;

      // 将力转换为速度增量（delta 是毫秒，转换为秒）
      const deltaSeconds = delta / 1000;
      ball.setVelocity(
        ball.body.velocity.x + forceX * deltaSeconds * 60,
        ball.body.velocity.y + forceY * deltaSeconds * 60
      );

      // 限制最大速度，防止小球飞出太远
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

    // 更新信息显示
    this.infoText.setText([
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${this.averageDistance.toFixed(2)}`,
      `Base Speed: ${this.baseSpeed}`,
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
      gravity: { y: 0 }, // 关闭默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);