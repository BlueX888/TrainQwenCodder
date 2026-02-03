class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 200; // 吸引速度基准
    this.averageSpeed = 0; // 状态信号：平均速度
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(16, 16, 16);
    centerGraphics.generateTexture('centerPoint', 32, 32);
    centerGraphics.destroy();

    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(10, 10, 10);
    ballGraphics.generateTexture('ball', 20, 20);
    ballGraphics.destroy();

    // 显示中心点
    this.centerPoint = this.add.image(this.centerX, this.centerY, 'centerPoint');

    // 创建5个小球
    for (let i = 0; i < 5; i++) {
      // 随机位置（避免太靠近中心）
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 150;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球初始随机速度
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
    this.add.text(10, 560, '5个小球受中心黄点吸引，吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    let totalSpeed = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 避免除以零或距离太小导致速度过大
      const safeDistance = Math.max(distance, 30);

      // 计算吸引力大小（与距离成反比）
      const attractionForce = this.attractionBase / safeDistance;

      // 计算从小球指向中心点的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力在x和y方向的分量
      const forceX = Math.cos(angle) * attractionForce;
      const forceY = Math.sin(angle) * attractionForce;

      // 应用吸引力到小球速度
      ball.setVelocity(
        ball.body.velocity.x + forceX,
        ball.body.velocity.y + forceY
      );

      // 限制最大速度，避免速度无限增长
      const maxSpeed = 400;
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );

      if (currentSpeed > maxSpeed) {
        const ratio = maxSpeed / currentSpeed;
        ball.setVelocity(
          ball.body.velocity.x * ratio,
          ball.body.velocity.y * ratio
        );
      }

      // 累加速度用于计算平均值
      totalSpeed += currentSpeed;
    });

    // 计算平均速度（状态信号）
    this.averageSpeed = totalSpeed / this.balls.length;

    // 更新信息显示
    this.infoText.setText([
      `平均速度: ${this.averageSpeed.toFixed(2)}`,
      `吸引基准: ${this.attractionBase}`,
      `小球数量: ${this.balls.length}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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