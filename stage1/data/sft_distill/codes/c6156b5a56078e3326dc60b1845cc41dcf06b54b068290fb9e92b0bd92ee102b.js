class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 120;
    this.ballsNearCenter = 0; // 状态信号：靠近中心的小球数量
    this.averageDistance = 0; // 状态信号：平均距离
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(10, 10, 10);
    ballGraphics.generateTexture('ball', 20, 20);
    ballGraphics.destroy();

    // 创建中心点纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(15, 15, 15);
    centerGraphics.generateTexture('center', 30, 30);
    centerGraphics.destroy();

    // 创建中心吸引点（静态显示）
    this.centerPoint = this.add.image(this.centerX, this.centerY, 'center');

    // 创建20个小球
    for (let i = 0; i < 20; i++) {
      // 随机位置（避开中心区域）
      let x, y;
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
      } while (Phaser.Math.Distance.Between(x, y, this.centerX, this.centerY) < 100);

      const ball = this.physics.add.sprite(x, y, 'ball');
      
      // 设置随机初始速度
      const randomVelocityX = Phaser.Math.Between(-100, 100);
      const randomVelocityY = Phaser.Math.Between(-100, 100);
      ball.setVelocity(randomVelocityX, randomVelocityY);
      
      // 设置边界反弹
      ball.setCollideWorldBounds(true);
      ball.setBounce(1, 1);
      
      // 关闭重力影响
      ball.body.allowGravity = false;
      
      this.balls.push(ball);
    }

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.add.text(10, 560, 'Green balls attracted to red center | Force = 120 / distance', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    let totalDistance = 0;
    this.ballsNearCenter = 0;

    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      totalDistance += distance;

      // 统计靠近中心的小球（距离小于100）
      if (distance < 100) {
        this.ballsNearCenter++;
      }

      // 防止除以零，设置最小距离
      const safeDistance = Math.max(distance, 10);

      // 计算引力大小：基准速度120除以距离
      const attractionForce = this.attractionBase / safeDistance;

      // 计算从小球指向中心的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 计算加速度分量
      const accelerationX = Math.cos(angle) * attractionForce;
      const accelerationY = Math.sin(angle) * attractionForce;

      // 施加加速度（通过修改速度实现）
      ball.setVelocity(
        ball.body.velocity.x + accelerationX,
        ball.body.velocity.y + accelerationY
      );

      // 限制最大速度，避免速度过快
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

    // 计算平均距离
    this.averageDistance = Math.round(totalDistance / this.balls.length);

    // 更新状态显示
    this.statusText.setText([
      `Balls Near Center (<100px): ${this.ballsNearCenter}/20`,
      `Average Distance: ${this.averageDistance}px`,
      `Attraction Base: ${this.attractionBase}`
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
  scene: GravityScene
};

new Phaser.Game(config);