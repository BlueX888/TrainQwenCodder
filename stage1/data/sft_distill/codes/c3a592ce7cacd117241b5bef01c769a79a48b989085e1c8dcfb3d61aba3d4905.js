class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseSpeed = 200;
    this.signals = {
      ballCount: 0,
      averageDistance: 0,
      minDistance: Infinity,
      maxDistance: 0,
      frameCount: 0
    };
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

    // 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ffff, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建10个小球
    for (let i = 0; i < 10; i++) {
      // 随机位置（避开中心区域）
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.FloatBetween(150, 350);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(false); // 允许小球移出边界
      ball.setDamping(true);
      ball.setDrag(0.1); // 轻微阻力
      
      // 给予初始随机速度
      const initialVelX = Phaser.Math.FloatBetween(-50, 50);
      const initialVelY = Phaser.Math.FloatBetween(-50, 50);
      ball.setVelocity(initialVelX, initialVelY);

      this.balls.push(ball);
    }

    this.signals.ballCount = this.balls.length;

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 暴露signals到全局
    window.__signals__ = this.signals;

    console.log('[INIT] Gravity field created with', this.balls.length, 'balls');
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    let totalDistance = 0;
    let minDist = Infinity;
    let maxDist = 0;

    this.balls.forEach((ball, index) => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 更新统计
      totalDistance += distance;
      minDist = Math.min(minDist, distance);
      maxDist = Math.max(maxDist, distance);

      // 计算吸引力方向
      const angle = Phaser.Math.Angle.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 吸引力与距离成反比，基准速度200
      // 为避免距离过小导致速度过大，设置最小距离限制
      const effectiveDistance = Math.max(distance, 20);
      const attractionSpeed = this.baseSpeed / effectiveDistance;

      // 计算加速度向量
      const accelX = Math.cos(angle) * attractionSpeed;
      const accelY = Math.sin(angle) * attractionSpeed;

      // 应用加速度（乘以deltaSeconds使其与帧率无关）
      ball.setAcceleration(accelX * 60, accelY * 60);

      // 如果小球移出边界太远，重置位置
      if (distance > 500) {
        const resetAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const resetDistance = Phaser.Math.FloatBetween(200, 300);
        ball.setPosition(
          this.centerX + Math.cos(resetAngle) * resetDistance,
          this.centerY + Math.sin(resetAngle) * resetDistance
        );
        ball.setVelocity(
          Phaser.Math.FloatBetween(-30, 30),
          Phaser.Math.FloatBetween(-30, 30)
        );
      }
    });

    // 更新signals
    this.signals.averageDistance = totalDistance / this.balls.length;
    this.signals.minDistance = minDist;
    this.signals.maxDistance = maxDist;
    this.signals.frameCount++;

    // 更新显示文本
    this.infoText.setText([
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${this.signals.averageDistance.toFixed(1)}`,
      `Min Distance: ${this.signals.minDistance.toFixed(1)}`,
      `Max Distance: ${this.signals.maxDistance.toFixed(1)}`,
      `Frame: ${this.signals.frameCount}`
    ]);

    // 每100帧输出一次日志
    if (this.signals.frameCount % 100 === 0) {
      console.log(JSON.stringify({
        type: 'gravity_field_state',
        timestamp: time,
        ballCount: this.signals.ballCount,
        averageDistance: parseFloat(this.signals.averageDistance.toFixed(2)),
        minDistance: parseFloat(this.signals.minDistance.toFixed(2)),
        maxDistance: parseFloat(this.signals.maxDistance.toFixed(2)),
        frame: this.signals.frameCount
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
      gravity: { y: 0 }, // 不使用全局重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);