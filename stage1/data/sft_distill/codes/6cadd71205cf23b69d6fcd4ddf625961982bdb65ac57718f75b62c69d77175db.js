class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttraction = 160;
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

    // 使用Graphics创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建15个小球
    for (let i = 0; i < 15; i++) {
      // 随机位置，避开中心区域
      let x, y, distance;
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
        distance = Phaser.Math.Distance.Between(x, y, this.centerX, this.centerY);
      } while (distance < 80); // 确保不会太靠近中心

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.1);
      
      // 给小球一个初始随机速度
      ball.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );

      this.balls.push(ball);
    }

    // 初始化信号对象
    window.__signals__ = {
      frameCount: 0,
      balls: [],
      centerX: this.centerX,
      centerY: this.centerY,
      baseAttraction: this.baseAttraction,
      averageDistance: 0,
      totalAttractionForce: 0
    };

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;
    let totalForce = 0;
    const ballsData = [];

    // 对每个小球应用向心吸引力
    this.balls.forEach((ball, index) => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力（与距离成反比）
      // 添加最小距离限制，避免除以零和过大的力
      const minDistance = 20;
      const effectiveDistance = Math.max(distance, minDistance);
      const attractionForce = this.baseAttraction / effectiveDistance;

      // 将吸引力分解为x和y方向的速度增量
      const deltaTime = delta / 1000; // 转换为秒
      const velocityX = Math.cos(angle) * attractionForce * deltaTime * 60;
      const velocityY = Math.sin(angle) * attractionForce * deltaTime * 60;

      // 应用速度增量
      ball.setVelocity(
        ball.body.velocity.x + velocityX,
        ball.body.velocity.y + velocityY
      );

      // 限制最大速度，避免小球飞得太快
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

      totalDistance += distance;
      totalForce += attractionForce;

      // 记录小球数据
      ballsData.push({
        id: index,
        x: Math.round(ball.x),
        y: Math.round(ball.y),
        velocityX: Math.round(ball.body.velocity.x),
        velocityY: Math.round(ball.body.velocity.y),
        distance: Math.round(distance),
        attractionForce: attractionForce.toFixed(2)
      });
    });

    // 更新信号数据
    window.__signals__.frameCount++;
    window.__signals__.balls = ballsData;
    window.__signals__.averageDistance = Math.round(totalDistance / this.balls.length);
    window.__signals__.totalAttractionForce = totalForce.toFixed(2);
    window.__signals__.timestamp = Date.now();

    // 更新显示文本
    const avgDistance = Math.round(totalDistance / this.balls.length);
    this.infoText.setText([
      `Frame: ${window.__signals__.frameCount}`,
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${avgDistance}px`,
      `Total Force: ${totalForce.toFixed(2)}`,
      `Base Attraction: ${this.baseAttraction}`
    ]);

    // 每100帧输出一次日志
    if (window.__signals__.frameCount % 100 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frameCount,
        averageDistance: window.__signals__.averageDistance,
        totalForce: window.__signals__.totalAttractionForce,
        ballCount: this.balls.length
      }));
    }
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