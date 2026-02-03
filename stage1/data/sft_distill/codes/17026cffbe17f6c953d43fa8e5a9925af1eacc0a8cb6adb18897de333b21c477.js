class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 80;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 8);
    centerGraphics.lineStyle(2, 0xff0000, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);

    // 使用 Graphics 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(10, 10, 10);
    ballGraphics.generateTexture('ball', 20, 20);
    ballGraphics.destroy();

    // 创建20个小球
    for (let i = 0; i < 20; i++) {
      // 随机位置（避开中心区域）
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 150;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给予初始随机速度
      const initialVelX = (Math.random() - 0.5) * 100;
      const initialVelY = (Math.random() - 0.5) * 100;
      ball.setVelocity(initialVelX, initialVelY);
      
      // 设置阻尼以防速度无限增长
      ball.setDamping(true);
      ball.setDrag(0.01);

      this.balls.push(ball);
    }

    // 添加说明文字
    this.add.text(10, 10, 'Gravity Field: 20 balls attracted to center', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 初始化信号对象
    window.__signals__ = {
      frameCount: 0,
      balls: [],
      centerX: this.centerX,
      centerY: this.centerY,
      attractionBase: this.attractionBase,
      avgDistance: 0,
      avgSpeed: 0
    };
  }

  update(time, delta) {
    let totalDistance = 0;
    let totalSpeed = 0;
    const ballStates = [];

    // 对每个小球应用引力
    this.balls.forEach((ball, index) => {
      // 计算到中心点的距离
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 避免除以零和过强的力
      const safeDist = Math.max(distance, 20);

      // 计算吸引力大小（与距离成反比）
      const forceMagnitude = this.attractionBase / safeDist;

      // 计算单位方向向量
      const dirX = dx / distance;
      const dirY = dy / distance;

      // 应用吸引力到速度
      ball.setAcceleration(
        dirX * forceMagnitude * 10,
        dirY * forceMagnitude * 10
      );

      // 限制最大速度
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      const maxSpeed = 300;
      if (currentSpeed > maxSpeed) {
        ball.setVelocity(
          (ball.body.velocity.x / currentSpeed) * maxSpeed,
          (ball.body.velocity.y / currentSpeed) * maxSpeed
        );
      }

      // 收集统计数据
      totalDistance += distance;
      totalSpeed += currentSpeed;

      ballStates.push({
        index: index,
        x: Math.round(ball.x),
        y: Math.round(ball.y),
        vx: Math.round(ball.body.velocity.x),
        vy: Math.round(ball.body.velocity.y),
        distance: Math.round(distance),
        speed: Math.round(currentSpeed)
      });
    });

    // 更新验证信号
    window.__signals__.frameCount++;
    window.__signals__.balls = ballStates;
    window.__signals__.avgDistance = Math.round(totalDistance / this.balls.length);
    window.__signals__.avgSpeed = Math.round(totalSpeed / this.balls.length);

    // 每60帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frameCount,
        avgDistance: window.__signals__.avgDistance,
        avgSpeed: window.__signals__.avgSpeed,
        sampleBall: ballStates[0]
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);