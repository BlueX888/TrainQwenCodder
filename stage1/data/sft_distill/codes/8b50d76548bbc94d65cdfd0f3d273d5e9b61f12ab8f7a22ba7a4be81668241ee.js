class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 200; // 吸引速度基准
    this.averageDistance = 0; // 状态信号：平均距离
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ballTex', 32, 32);
    graphics.destroy();

    // 创建中心吸引点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xff0000, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 30);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 60);

    // 创建5个小球，随机分布在场景中
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const ball = this.physics.add.sprite(x, y, 'ballTex');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8); // 碰撞边界时反弹
      
      // 给小球一个初始随机速度
      ball.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
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
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用引力
    this.balls.forEach((ball, index) => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x,
        ball.y,
        this.centerX,
        this.centerY
      );

      totalDistance += distance;

      // 计算吸引力方向（从小球指向中心点的角度）
      const angle = Phaser.Math.Angle.Between(
        ball.x,
        ball.y,
        this.centerX,
        this.centerY
      );

      // 防止距离为0时除法错误，设置最小距离
      const safeDistance = Math.max(distance, 10);

      // 计算吸引力大小：与距离成反比
      // 公式：attractionForce = attractionBase / distance
      const attractionForce = this.attractionBase / safeDistance;

      // 计算加速度分量
      const accelerationX = Math.cos(angle) * attractionForce;
      const accelerationY = Math.sin(angle) * attractionForce;

      // 应用加速度到速度（使用delta时间来平滑）
      const deltaSeconds = delta / 1000;
      ball.setVelocity(
        ball.body.velocity.x + accelerationX * deltaSeconds * 60,
        ball.body.velocity.y + accelerationY * deltaSeconds * 60
      );

      // 限制最大速度，防止速度过快
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

    // 计算平均距离作为状态信号
    this.averageDistance = totalDistance / this.balls.length;

    // 更新状态显示
    this.statusText.setText([
      `Attraction Base: ${this.attractionBase}`,
      `Average Distance: ${this.averageDistance.toFixed(2)}`,
      `Balls Count: ${this.balls.length}`,
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
      gravity: { y: 0 }, // 关闭默认重力，使用自定义引力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);