class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 240;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xff0000, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);

    // 使用 Graphics 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建10个小球，随机分布在场景中
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i;
      const distance = 150 + Math.random() * 150;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

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

    // 添加说明文字
    this.add.text(10, 10, 'Gravity Field Demo', {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.add.text(10, 40, '10 balls attracted to center', {
      fontSize: '14px',
      color: '#cccccc'
    });

    // 初始化信号对象
    window.__signals__ = {
      ballCount: 10,
      centerX: this.centerX,
      centerY: this.centerY,
      attractionBase: this.attractionBase,
      ballStates: [],
      frameCount: 0
    };
  }

  update(time, delta) {
    // 更新每个小球受到的引力
    this.balls.forEach((ball, index) => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x,
        ball.y,
        this.centerX,
        this.centerY
      );

      // 防止距离过小导致速度过大
      const safeDist = Math.max(distance, 20);

      // 计算吸引力大小（与距离成反比）
      const attractionForce = this.attractionBase / safeDist;

      // 计算从小球指向中心的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x,
        ball.y,
        this.centerX,
        this.centerY
      );

      // 计算加速度分量
      const accelX = Math.cos(angle) * attractionForce;
      const accelY = Math.sin(angle) * attractionForce;

      // 应用加速度到速度（使用 delta 时间进行平滑）
      const deltaSeconds = delta / 1000;
      ball.setVelocity(
        ball.body.velocity.x + accelX * deltaSeconds,
        ball.body.velocity.y + accelY * deltaSeconds
      );

      // 限制最大速度，防止小球飞出
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

    // 更新信号数据（每10帧更新一次以减少数据量）
    if (window.__signals__.frameCount % 10 === 0) {
      window.__signals__.ballStates = this.balls.map((ball, i) => {
        const distance = Phaser.Math.Distance.Between(
          ball.x,
          ball.y,
          this.centerX,
          this.centerY
        );
        return {
          id: i,
          x: Math.round(ball.x),
          y: Math.round(ball.y),
          vx: Math.round(ball.body.velocity.x),
          vy: Math.round(ball.body.velocity.y),
          distanceToCenter: Math.round(distance),
          speed: Math.round(Math.sqrt(
            ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
          ))
        };
      });

      // 计算平均距离
      const avgDistance = window.__signals__.ballStates.reduce(
        (sum, state) => sum + state.distanceToCenter, 0
      ) / this.balls.length;
      window.__signals__.averageDistance = Math.round(avgDistance);

      // 输出日志（每100帧）
      if (window.__signals__.frameCount % 100 === 0) {
        console.log(JSON.stringify({
          frame: window.__signals__.frameCount,
          avgDistance: window.__signals__.averageDistance,
          ballCount: this.balls.length
        }));
      }
    }

    window.__signals__.frameCount++;
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