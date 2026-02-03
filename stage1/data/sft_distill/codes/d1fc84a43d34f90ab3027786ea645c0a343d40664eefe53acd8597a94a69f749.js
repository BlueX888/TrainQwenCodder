class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 160; // 吸引速度基准
    this.averageDistance = 0; // 状态信号：平均距离
  }

  preload() {
    // 使用 Graphics 创建小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('ball', 20, 20);
    graphics.destroy();

    // 创建中心点纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(15, 15, 15);
    centerGraphics.generateTexture('center', 30, 30);
    centerGraphics.destroy();
  }

  create() {
    // 添加中心吸引点
    const centerPoint = this.add.image(this.centerX, this.centerY, 'center');
    centerPoint.setDepth(10);

    // 创建20个小球，随机分布在场景中
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      
      // 设置初始随机速度
      ball.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      
      // 设置边界碰撞
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 关闭重力影响
      ball.body.allowGravity = false;
      
      this.balls.push(ball);
    }

    // 添加调试文本显示状态
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.debugText.setDepth(20);
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用向中心的吸引力
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      totalDistance += distance;

      // 避免除以零，设置最小距离
      const effectiveDistance = Math.max(distance, 10);

      // 计算吸引力大小：基准速度 / 距离
      const attractionStrength = this.attractionBase / effectiveDistance;

      // 计算从小球指向中心的方向向量
      const angle = Phaser.Math.Angle.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 计算吸引力在 x 和 y 方向的分量
      const forceX = Math.cos(angle) * attractionStrength;
      const forceY = Math.sin(angle) * attractionStrength;

      // 应用吸引力到速度（累加而不是直接设置）
      ball.setVelocity(
        ball.body.velocity.x + forceX,
        ball.body.velocity.y + forceY
      );

      // 限制最大速度，避免小球飞得太快
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
    });

    // 更新状态信号：平均距离
    this.averageDistance = totalDistance / this.balls.length;

    // 更新调试信息
    this.debugText.setText([
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${this.averageDistance.toFixed(2)}`,
      `Attraction Base: ${this.attractionBase}`,
      `Center: (${this.centerX}, ${this.centerY})`
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