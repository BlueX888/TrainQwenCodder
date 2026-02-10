class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseSpeed = 120;
    // 状态信号
    this.averageDistance = 0;
    this.totalForce = 0;
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

    // 使用 Graphics 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(12, 12, 12);
    ballGraphics.generateTexture('ball', 24, 24);
    ballGraphics.destroy();

    // 创建8个小球，随机分布在场景中
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 
                    0xff00ff, 0x00ffff, 0xff8800, 0x8800ff];
    
    for (let i = 0; i < 8; i++) {
      // 为每个小球创建不同颜色的纹理
      const colorGraphics = this.add.graphics();
      colorGraphics.fillStyle(colors[i], 1);
      colorGraphics.fillCircle(12, 12, 12);
      colorGraphics.generateTexture(`ball${i}`, 24, 24);
      colorGraphics.destroy();

      // 随机位置（避免在中心点附近）
      const angle = (Math.PI * 2 * i) / 8;
      const distance = Phaser.Math.Between(150, 280);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      // 创建物理精灵
      const ball = this.physics.add.sprite(x, y, `ball${i}`);
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.1);
      
      // 给小球一些初始速度（切向速度，形成轨道效果）
      const tangentAngle = angle + Math.PI / 2;
      ball.setVelocity(
        Math.cos(tangentAngle) * 50,
        Math.sin(tangentAngle) * 50
      );

      this.balls.push(ball);
    }

    // 添加信息显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    let totalDistance = 0;
    let totalForce = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 避免除零和距离过小时的极大力
      const safeDist = Math.max(distance, 20);

      // 计算引力大小（与距离成反比）
      // 力 = 基准速度 / 距离
      const forceMagnitude = this.baseSpeed / safeDist;

      // 计算方向角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 将力分解为 x 和 y 分量
      const forceX = Math.cos(angle) * forceMagnitude;
      const forceY = Math.sin(angle) * forceMagnitude;

      // 应用速度（累加到当前速度）
      ball.setVelocity(
        ball.body.velocity.x + forceX * deltaSeconds * 60,
        ball.body.velocity.y + forceY * deltaSeconds * 60
      );

      // 限制最大速度，避免小球飞出控制
      const maxSpeed = 300;
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      if (currentSpeed > maxSpeed) {
        ball.setVelocity(
          (ball.body.velocity.x / currentSpeed) * maxSpeed,
          (ball.body.velocity.y / currentSpeed) * maxSpeed
        );
      }

      totalDistance += distance;
      totalForce += forceMagnitude;
    });

    // 更新状态信号
    this.averageDistance = totalDistance / this.balls.length;
    this.totalForce = totalForce;

    // 显示信息
    this.infoText.setText([
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${this.averageDistance.toFixed(1)}`,
      `Total Force: ${this.totalForce.toFixed(2)}`,
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