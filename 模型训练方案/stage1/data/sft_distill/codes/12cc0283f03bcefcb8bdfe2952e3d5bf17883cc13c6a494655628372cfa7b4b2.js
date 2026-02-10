class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.gravityBase = 160;
    this.averageDistance = 0; // 状态信号：小球平均距离
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xff0000, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 150);

    // 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ffff, 1);
    ballGraphics.fillCircle(12, 12, 12);
    ballGraphics.generateTexture('ball', 24, 24);
    ballGraphics.destroy();

    // 创建8个小球，随机分布在中心点周围
    const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 
                    0xff6600, 0x6600ff, 0x00ff99, 0xff0099];
    
    for (let i = 0; i < 8; i++) {
      // 随机角度和距离
      const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
      const distance = 150 + Math.random() * 100;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      // 创建物理精灵
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setTint(colors[i]);
      
      // 设置初始速度（切线方向）
      const tangentAngle = angle + Math.PI / 2;
      const initialSpeed = 50 + Math.random() * 30;
      ball.setVelocity(
        Math.cos(tangentAngle) * initialSpeed,
        Math.sin(tangentAngle) * initialSpeed
      );

      // 关闭默认重力和阻力
      ball.body.setAllowGravity(false);
      ball.body.setDrag(0);
      ball.body.setBounce(1, 1);
      ball.body.setCollideWorldBounds(true);

      this.balls.push(ball);
    }

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 550, '重力场效果：小球受中心红点吸引\n吸引力 = 速度基准(160) / 距离', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;
    
    // 对每个小球应用重力场效果
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      totalDistance += distance;

      // 避免除以零和过强的吸引力
      const safeDistance = Math.max(distance, 20);

      // 计算吸引力大小（与距离成反比）
      const gravityStrength = this.gravityBase / safeDistance;

      // 计算从小球指向中心的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力的速度分量
      const gravityVX = Math.cos(angle) * gravityStrength;
      const gravityVY = Math.sin(angle) * gravityStrength;

      // 应用吸引力（叠加到当前速度）
      const deltaSeconds = delta / 1000;
      ball.setVelocity(
        ball.body.velocity.x + gravityVX * deltaSeconds * 60,
        ball.body.velocity.y + gravityVY * deltaSeconds * 60
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

    // 更新状态显示
    this.statusText.setText([
      `小球数量: ${this.balls.length}`,
      `平均距离: ${this.averageDistance.toFixed(1)} px`,
      `重力基准: ${this.gravityBase}`,
      `状态: ${this.averageDistance < 100 ? '紧密' : this.averageDistance < 200 ? '中等' : '分散'}`
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