class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 80;
    
    // 可验证的状态信号
    window.__signals__ = {
      averageDistance: 0,
      minDistance: 0,
      maxDistance: 0,
      ballCount: 15,
      frameCount: 0
    };
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xff0000, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);

    // 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ffff, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建15个小球
    for (let i = 0; i < 15; i++) {
      // 随机位置（避免太靠近中心）
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 200;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给予初始随机速度
      const initialVelX = (Math.random() - 0.5) * 100;
      const initialVelY = (Math.random() - 0.5) * 100;
      ball.setVelocity(initialVelX, initialVelY);
      
      this.balls.push(ball);
    }

    // 小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls);

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log(JSON.stringify({
      type: 'GAME_START',
      ballCount: 15,
      centerX: this.centerX,
      centerY: this.centerY,
      attractionBase: this.attractionBase
    }));
  }

  update(time, delta) {
    let totalDistance = 0;
    let minDist = Infinity;
    let maxDist = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离和角度
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );
      
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力（速度与距离成反比）
      // 避免距离为0时除零错误，设置最小距离
      const effectiveDistance = Math.max(distance, 10);
      const attractionSpeed = this.attractionBase / effectiveDistance;

      // 计算吸引力的速度分量
      const attractionVelX = Math.cos(angle) * attractionSpeed * 60 * (delta / 1000);
      const attractionVelY = Math.sin(angle) * attractionSpeed * 60 * (delta / 1000);

      // 应用吸引力到当前速度
      ball.setVelocity(
        ball.body.velocity.x + attractionVelX,
        ball.body.velocity.y + attractionVelY
      );

      // 限制最大速度，防止过快
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

      // 统计距离
      totalDistance += distance;
      minDist = Math.min(minDist, distance);
      maxDist = Math.max(maxDist, distance);
    });

    // 更新信号
    const avgDistance = totalDistance / this.balls.length;
    window.__signals__.averageDistance = Math.round(avgDistance);
    window.__signals__.minDistance = Math.round(minDist);
    window.__signals__.maxDistance = Math.round(maxDist);
    window.__signals__.frameCount++;

    // 更新显示文本
    this.infoText.setText([
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${Math.round(avgDistance)}`,
      `Min Distance: ${Math.round(minDist)}`,
      `Max Distance: ${Math.round(maxDist)}`,
      `Frame: ${window.__signals__.frameCount}`
    ]);

    // 每60帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        type: 'GRAVITY_UPDATE',
        frame: window.__signals__.frameCount,
        averageDistance: window.__signals__.averageDistance,
        minDistance: window.__signals__.minDistance,
        maxDistance: window.__signals__.maxDistance
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