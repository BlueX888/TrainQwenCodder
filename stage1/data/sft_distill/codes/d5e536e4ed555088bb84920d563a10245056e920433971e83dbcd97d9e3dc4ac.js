class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 300;
    this.averageDistance = 0; // 可验证状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点标记（红色圆点）
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);

    // 使用Graphics生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00aaff, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建12个小球，随机分布在场景中
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      const radius = 200 + Math.random() * 100;
      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一些初始随机速度
      const initialVelX = (Math.random() - 0.5) * 100;
      const initialVelY = (Math.random() - 0.5) * 100;
      ball.setVelocity(initialVelX, initialVelY);
      
      this.balls.push(ball);
    }

    // 添加小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 550, '12个小球受中心红点引力吸引\n吸引力 = 300 / 距离', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      totalDistance += distance;

      // 避免除以零，当距离很小时限制最小值
      const safeDistance = Math.max(distance, 20);

      // 计算吸引力大小（与距离成反比）
      const attractionForce = this.attractionBase / safeDistance;

      // 计算从小球指向中心点的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 计算吸引力在x和y方向的分量
      const forceX = Math.cos(angle) * attractionForce;
      const forceY = Math.sin(angle) * attractionForce;

      // 获取当前速度
      const currentVelX = ball.body.velocity.x;
      const currentVelY = ball.body.velocity.y;

      // 应用吸引力（叠加到当前速度）
      ball.setVelocity(
        currentVelX + forceX * (delta / 1000),
        currentVelY + forceY * (delta / 1000)
      );

      // 限制最大速度，避免小球移动过快
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

    // 更新状态信号：平均距离
    this.averageDistance = totalDistance / this.balls.length;

    // 更新状态显示
    this.statusText.setText(
      `小球数量: ${this.balls.length}\n` +
      `平均距离: ${this.averageDistance.toFixed(2)}\n` +
      `吸引基准: ${this.attractionBase}`
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
      gravity: { y: 0 }, // 关闭默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);