class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 300; // 吸引速度基准
    this.averageDistance = 0; // 状态信号：平均距离
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
    const center = this.add.image(this.centerX, this.centerY, 'centerPoint');
    center.setDepth(10);

    // 创建8个小球，随机分布
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = Phaser.Math.Between(150, 250);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一个初始切向速度，形成轨道效果
      const tangentAngle = angle + Math.PI / 2;
      ball.setVelocity(
        Math.cos(tangentAngle) * 100,
        Math.sin(tangentAngle) * 100
      );
      
      this.balls.push(ball);
    }

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(100);

    // 添加说明文本
    this.add.text(10, 550, '8个小球受中心点吸引，吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用重力场效果
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x,
        ball.y,
        this.centerX,
        this.centerY
      );

      // 计算角度
      const angle = Phaser.Math.Angle.Between(
        ball.x,
        ball.y,
        this.centerX,
        this.centerY
      );

      // 计算吸引力（速度与距离成反比）
      // 防止距离过小导致速度过大
      const safeDistance = Math.max(distance, 50);
      const attractionSpeed = this.attractionBase / safeDistance;

      // 计算吸引力在x和y方向的分量
      const forceX = Math.cos(angle) * attractionSpeed;
      const forceY = Math.sin(angle) * attractionSpeed;

      // 应用吸引力（累加到当前速度）
      ball.setVelocity(
        ball.body.velocity.x + forceX * (delta / 1000),
        ball.body.velocity.y + forceY * (delta / 1000)
      );

      // 限制最大速度，避免速度过快
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

      totalDistance += distance;
    });

    // 更新平均距离状态
    this.averageDistance = Math.round(totalDistance / this.balls.length);

    // 更新状态显示
    this.statusText.setText([
      `平均距离: ${this.averageDistance}px`,
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
      gravity: { y: 0 }, // 禁用默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);