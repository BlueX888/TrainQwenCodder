class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 80; // 吸引速度基准
    this.averageDistance = 0; // 可验证状态信号
    this.frameCount = 0;
  }

  preload() {
    // 使用 Graphics 创建小球纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 创建小球纹理
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    
    // 创建中心点纹理
    graphics.clear();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(12, 12, 12);
    graphics.generateTexture('center', 24, 24);
    
    graphics.destroy();
  }

  create() {
    // 添加中心点标记
    const centerPoint = this.add.sprite(this.centerX, this.centerY, 'center');
    centerPoint.setDepth(10);

    // 创建8个小球，均匀分布在圆周上
    const radius = 200;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius;
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一个初始切向速度，形成更有趣的运动
      const tangentAngle = angle + Math.PI / 2;
      ball.setVelocity(
        Math.cos(tangentAngle) * 50,
        Math.sin(tangentAngle) * 50
      );
      
      this.balls.push(ball);
    }

    // 添加文本显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(100);

    // 添加视觉辅助线（可选）
    this.debugGraphics = this.add.graphics();
  }

  update(time, delta) {
    this.frameCount++;
    let totalDistance = 0;

    // 清除上一帧的调试图形
    this.debugGraphics.clear();
    this.debugGraphics.lineStyle(1, 0x444444, 0.3);

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      totalDistance += distance;

      // 绘制连接线（视觉反馈）
      this.debugGraphics.lineBetween(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 防止除零和过强的吸引力
      if (distance < 10) return;

      // 计算吸引力方向（从球指向中心）
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力大小：速度 = attractionBase / distance
      const attractionSpeed = this.attractionBase / distance;

      // 将吸引力转换为速度分量
      const forceX = Math.cos(angle) * attractionSpeed;
      const forceY = Math.sin(angle) * attractionSpeed;

      // 应用引力（累加到当前速度）
      ball.setVelocity(
        ball.body.velocity.x + forceX,
        ball.body.velocity.y + forceY
      );

      // 限制最大速度，防止速度过快
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

    // 更新平均距离状态
    this.averageDistance = Math.round(totalDistance / this.balls.length);

    // 更新状态显示
    if (this.frameCount % 10 === 0) { // 每10帧更新一次文本
      this.statusText.setText([
        `Average Distance: ${this.averageDistance}`,
        `Attraction Base: ${this.attractionBase}`,
        `Balls Count: ${this.balls.length}`,
        `Frame: ${this.frameCount}`
      ]);
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
      gravity: { y: 0 }, // 无全局重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);