class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseSpeed = 80;
    this.frameCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('ballTex', 20, 20);
    graphics.destroy();

    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 15);
    centerGraphics.lineStyle(2, 0xffffff, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 15);

    // 创建20个小球，随机分布在场景中
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.physics.add.sprite(x, y, 'ballTex');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一个初始随机速度
      ball.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      
      this.balls.push(ball);
    }

    // 初始化信号对象
    window.__signals__ = {
      ballCount: 20,
      centerX: this.centerX,
      centerY: this.centerY,
      baseSpeed: this.baseSpeed,
      averageDistance: 0,
      minDistance: 0,
      maxDistance: 0,
      totalForceApplied: 0,
      frameCount: 0
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
    this.frameCount++;
    
    let totalDistance = 0;
    let minDist = Infinity;
    let maxDist = 0;
    let totalForce = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
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

      // 计算引力大小：基准速度 / 距离（避免除零）
      const forceMagnitude = distance > 1 ? this.baseSpeed / distance : this.baseSpeed;

      // 将引力转换为速度分量
      const forceX = Math.cos(angle) * forceMagnitude;
      const forceY = Math.sin(angle) * forceMagnitude;

      // 应用引力到速度（累加而不是直接设置）
      ball.setVelocity(
        ball.body.velocity.x + forceX,
        ball.body.velocity.y + forceY
      );

      // 限制最大速度，避免无限加速
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

      // 统计数据
      totalDistance += distance;
      minDist = Math.min(minDist, distance);
      maxDist = Math.max(maxDist, distance);
      totalForce += forceMagnitude;
    });

    // 计算平均值
    const avgDistance = totalDistance / this.balls.length;

    // 更新信号
    window.__signals__.averageDistance = Math.round(avgDistance * 100) / 100;
    window.__signals__.minDistance = Math.round(minDist * 100) / 100;
    window.__signals__.maxDistance = Math.round(maxDist * 100) / 100;
    window.__signals__.totalForceApplied = Math.round(totalForce * 100) / 100;
    window.__signals__.frameCount = this.frameCount;

    // 更新显示文本
    this.infoText.setText([
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${window.__signals__.averageDistance}`,
      `Min Distance: ${window.__signals__.minDistance}`,
      `Max Distance: ${window.__signals__.maxDistance}`,
      `Total Force: ${window.__signals__.totalForceApplied}`,
      `Frame: ${this.frameCount}`
    ]);

    // 每60帧输出一次日志
    if (this.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        timestamp: time,
        frame: this.frameCount,
        signals: window.__signals__
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
      gravity: { y: 0 },  // 关闭默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);