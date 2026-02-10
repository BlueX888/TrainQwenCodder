class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttraction = 160; // 吸引速度基准
    this.averageDistance = 0; // 状态信号：平均距离
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

    // 使用 Graphics 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ffff, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建10个小球，随机分布在场景中
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i;
      const radius = 150 + Math.random() * 100;
      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球初始随机速度
      const randomVelX = (Math.random() - 0.5) * 100;
      const randomVelY = (Math.random() - 0.5) * 100;
      ball.setVelocity(randomVelX, randomVelY);

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
    this.add.text(10, 550, '10个小球受中心黄点吸引，吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#ffff00'
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

      // 避免除以零或距离过小导致速度过大
      if (distance < 5) {
        return;
      }

      // 计算方向向量（从小球指向中心）
      const dirX = (this.centerX - ball.x) / distance;
      const dirY = (this.centerY - ball.y) / distance;

      // 计算吸引力：基准速度 / 距离（距离越近，吸引力越大）
      const attractionForce = this.baseAttraction / distance;

      // 应用吸引力到速度（使用 delta 时间来保证帧率独立）
      const deltaSeconds = delta / 1000;
      const velocityChangeX = dirX * attractionForce * deltaSeconds * 60; // 乘以60来调整到合适的速度
      const velocityChangeY = dirY * attractionForce * deltaSeconds * 60;

      ball.setVelocity(
        ball.body.velocity.x + velocityChangeX,
        ball.body.velocity.y + velocityChangeY
      );

      // 限制最大速度，避免速度过大
      const maxSpeed = 300;
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

    // 计算平均距离作为状态信号
    this.averageDistance = totalDistance / this.balls.length;

    // 更新状态显示
    this.statusText.setText(
      `小球数量: ${this.balls.length}\n` +
      `平均距离: ${this.averageDistance.toFixed(2)}\n` +
      `吸引基准: ${this.baseAttraction}`
    );
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
      gravity: { y: 0 }, // 禁用默认重力，使用自定义重力场
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);