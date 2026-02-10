class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionSpeed = 240;
    this.averageDistance = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xffff00, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);

    // 使用 Graphics 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(12, 12, 12);
    ballGraphics.lineStyle(2, 0xffffff, 0.8);
    ballGraphics.strokeCircle(12, 12, 12);
    ballGraphics.generateTexture('ball', 24, 24);
    ballGraphics.destroy();

    // 创建8个小球
    for (let i = 0; i < 8; i++) {
      // 在画布边缘随机位置生成小球
      let x, y;
      const edge = Phaser.Math.Between(0, 3);
      switch(edge) {
        case 0: // 上边
          x = Phaser.Math.Between(50, 750);
          y = Phaser.Math.Between(50, 100);
          break;
        case 1: // 右边
          x = Phaser.Math.Between(700, 750);
          y = Phaser.Math.Between(50, 550);
          break;
        case 2: // 下边
          x = Phaser.Math.Between(50, 750);
          y = Phaser.Math.Between(500, 550);
          break;
        case 3: // 左边
          x = Phaser.Math.Between(50, 100);
          y = Phaser.Math.Between(50, 550);
          break;
      }

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.1);
      
      // 给小球一个初始随机速度
      const initialVelocity = 50;
      ball.setVelocity(
        Phaser.Math.Between(-initialVelocity, initialVelocity),
        Phaser.Math.Between(-initialVelocity, initialVelocity)
      );

      this.balls.push(ball);
    }

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用向中心的吸引力
    this.balls.forEach((ball, index) => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      totalDistance += distance;

      // 计算角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力速度：速度基准 / 距离（避免除零）
      const attractionForce = distance > 10 
        ? this.attractionSpeed / distance 
        : this.attractionSpeed / 10;

      // 计算速度分量
      const velocityX = Math.cos(angle) * attractionForce * 60;
      const velocityY = Math.sin(angle) * attractionForce * 60;

      // 应用加速度（而不是直接设置速度，使运动更平滑）
      ball.setAcceleration(velocityX, velocityY);

      // 限制最大速度，防止小球运动过快
      const maxSpeed = 400;
      if (ball.body.velocity.length() > maxSpeed) {
        ball.body.velocity.normalize().scale(maxSpeed);
      }
    });

    // 计算平均距离作为状态信号
    this.averageDistance = totalDistance / this.balls.length;

    // 更新状态显示
    this.statusText.setText([
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${this.averageDistance.toFixed(2)}`,
      `Attraction Speed: ${this.attractionSpeed}`,
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