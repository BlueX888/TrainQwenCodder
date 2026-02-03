class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 200; // 吸引速度基准
    this.totalKineticEnergy = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xff0000, 0.3);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);

    // 使用 Graphics 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00aaff, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建20个小球
    for (let i = 0; i < 20; i++) {
      // 随机位置，避开中心区域
      let x, y, distance;
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
        distance = Phaser.Math.Distance.Between(x, y, this.centerX, this.centerY);
      } while (distance < 80); // 确保不会太靠近中心

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8); // 添加弹性
      
      // 给予初始随机速度
      const initialVelX = Phaser.Math.Between(-50, 50);
      const initialVelY = Phaser.Math.Between(-50, 50);
      ball.setVelocity(initialVelX, initialVelY);
      
      // 设置阻尼，模拟空气阻力
      ball.setDamping(true);
      ball.setDrag(0.01);
      
      this.balls.push(ball);
    }

    // 添加信息文本
    this.energyText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.infoText = this.add.text(10, 40, 
      'Gravity Field Demo\nAttraction Base: 200\nBalls: 20', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    this.totalKineticEnergy = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 避免除以零或距离过小导致力过大
      if (distance < 20) {
        return;
      }

      // 计算方向向量
      const dirX = this.centerX - ball.x;
      const dirY = this.centerY - ball.y;

      // 归一化方向向量
      const normalizedDirX = dirX / distance;
      const normalizedDirY = dirY / distance;

      // 计算吸引力大小：力 = 基准速度 / 距离
      const attractionForce = this.attractionBase / distance;

      // 计算加速度（这里简化为直接影响速度）
      // 使用 delta 时间来保证帧率独立
      const deltaSeconds = delta / 1000;
      const accelerationX = normalizedDirX * attractionForce * deltaSeconds;
      const accelerationY = normalizedDirY * attractionForce * deltaSeconds;

      // 应用加速度到当前速度
      ball.setVelocity(
        ball.body.velocity.x + accelerationX,
        ball.body.velocity.y + accelerationY
      );

      // 限制最大速度，防止速度过快
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

      // 计算动能 (1/2 * m * v^2)，这里假设质量为1
      const kineticEnergy = 0.5 * currentSpeed * currentSpeed;
      this.totalKineticEnergy += kineticEnergy;
    });

    // 更新状态信息
    this.energyText.setText(
      `Total Kinetic Energy: ${Math.round(this.totalKineticEnergy)}\n` +
      `Frame Time: ${Math.round(delta)}ms`
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
      gravity: { y: 0 }, // 禁用默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);