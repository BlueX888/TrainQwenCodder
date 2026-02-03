class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 200;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('ball', 20, 20);
    graphics.destroy();

    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 15);
    centerGraphics.lineStyle(2, 0xff0000, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 150);

    // 创建10个小球，随机分布在场景中
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i;
      const radius = 150 + Math.random() * 100;
      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius;
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一个初始切向速度，形成轨道效果
      const tangentAngle = angle + Math.PI / 2;
      ball.setVelocity(
        Math.cos(tangentAngle) * 50,
        Math.sin(tangentAngle) * 50
      );
      
      this.balls.push(ball);
    }

    // 初始化状态信号
    window.__signals__ = {
      centerX: this.centerX,
      centerY: this.centerY,
      attractionBase: this.attractionBase,
      ballCount: 10,
      balls: [],
      averageDistance: 0,
      totalAttractionForce: 0
    };

    // 添加说明文字
    this.add.text(10, 10, 'Gravity Field Simulation', {
      fontSize: '20px',
      color: '#ffffff'
    });
    this.add.text(10, 40, 'Red center attracts blue balls', {
      fontSize: '14px',
      color: '#cccccc'
    });
    this.add.text(10, 560, 'Attraction = 200 / distance', {
      fontSize: '12px',
      color: '#aaaaaa'
    });
  }

  update(time, delta) {
    let totalDistance = 0;
    let totalForce = 0;
    const ballStates = [];

    this.balls.forEach((ball, index) => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 防止距离过小导致力过大
      const safeDistance = Math.max(distance, 20);

      // 计算吸引力大小：F = 基准速度 / 距离
      const attractionForce = this.attractionBase / safeDistance;

      // 计算从小球指向中心的单位向量
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      
      if (magnitude > 0) {
        const unitX = dx / magnitude;
        const unitY = dy / magnitude;

        // 应用吸引力到速度（使用加速度方式）
        const acceleration = attractionForce * (delta / 1000);
        ball.setVelocity(
          ball.body.velocity.x + unitX * acceleration,
          ball.body.velocity.y + unitY * acceleration
        );

        // 限制最大速度，防止小球飞得太快
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
      }

      // 收集统计数据
      totalDistance += distance;
      totalForce += attractionForce;

      ballStates.push({
        id: index,
        x: Math.round(ball.x * 10) / 10,
        y: Math.round(ball.y * 10) / 10,
        velocityX: Math.round(ball.body.velocity.x * 10) / 10,
        velocityY: Math.round(ball.body.velocity.y * 10) / 10,
        distance: Math.round(distance * 10) / 10,
        attractionForce: Math.round(attractionForce * 100) / 100
      });
    });

    // 更新状态信号
    window.__signals__.balls = ballStates;
    window.__signals__.averageDistance = Math.round((totalDistance / this.balls.length) * 10) / 10;
    window.__signals__.totalAttractionForce = Math.round(totalForce * 100) / 100;
    window.__signals__.timestamp = time;

    // 每秒输出一次日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      console.log(JSON.stringify({
        time: Math.round(time),
        averageDistance: window.__signals__.averageDistance,
        totalForce: window.__signals__.totalAttractionForce,
        ballCount: this.balls.length
      }));
      this.lastLogTime = time;
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
      gravity: { y: 0 },  // 禁用默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);