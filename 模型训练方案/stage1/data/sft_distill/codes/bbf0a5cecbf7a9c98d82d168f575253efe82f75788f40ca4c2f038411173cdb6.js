class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttractionSpeed = 300;
    this.averageDistance = 0; // 可验证的状态信号
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

    // 使用Graphics生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(15, 15, 15);
    ballGraphics.generateTexture('ball', 30, 30);
    ballGraphics.destroy();

    // 创建5个小球，随机分布在场景中
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 }
    ];

    for (let i = 0; i < 5; i++) {
      const ball = this.physics.add.sprite(
        positions[i].x,
        positions[i].y,
        'ball'
      );
      
      // 设置小球属性
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.95);
      
      // 给小球一个初始随机速度
      const randomVelX = Phaser.Math.Between(-50, 50);
      const randomVelY = Phaser.Math.Between(-50, 50);
      ball.setVelocity(randomVelX, randomVelY);
      
      this.balls.push(ball);
    }

    // 添加文本显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用向中心点的吸引力
    this.balls.forEach((ball, index) => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x,
        ball.y,
        this.centerX,
        this.centerY
      );

      totalDistance += distance;

      // 避免除以零，设置最小距离
      const safeDistance = Math.max(distance, 50);

      // 计算吸引力强度（与距离成反比）
      const attractionStrength = this.baseAttractionSpeed / safeDistance;

      // 计算从小球指向中心点的方向向量
      const directionX = this.centerX - ball.x;
      const directionY = this.centerY - ball.y;

      // 归一化方向向量
      const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
      const normalizedX = directionX / magnitude;
      const normalizedY = directionY / magnitude;

      // 计算吸引力速度（考虑delta时间）
      const attractionVelX = normalizedX * attractionStrength * (delta / 16.67);
      const attractionVelY = normalizedY * attractionStrength * (delta / 16.67);

      // 应用吸引力到小球的当前速度
      ball.setVelocity(
        ball.body.velocity.x + attractionVelX,
        ball.body.velocity.y + attractionVelY
      );

      // 限制最大速度，防止小球移动过快
      const maxSpeed = 400;
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x * ball.body.velocity.x +
        ball.body.velocity.y * ball.body.velocity.y
      );

      if (currentSpeed > maxSpeed) {
        const scale = maxSpeed / currentSpeed;
        ball.setVelocity(
          ball.body.velocity.x * scale,
          ball.body.velocity.y * scale
        );
      }
    });

    // 更新平均距离状态信号
    this.averageDistance = Math.round(totalDistance / this.balls.length);

    // 更新状态显示
    this.statusText.setText([
      `Average Distance: ${this.averageDistance}`,
      `Attraction Base Speed: ${this.baseAttractionSpeed}`,
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