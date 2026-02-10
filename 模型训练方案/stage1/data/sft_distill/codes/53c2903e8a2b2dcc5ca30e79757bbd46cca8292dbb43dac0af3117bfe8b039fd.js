class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseGravitySpeed = 240;
    // 状态信号
    this.averageDistance = 0;
    this.closestDistance = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xff0000, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);

    // 使用 Graphics 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ffff, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建15个小球
    for (let i = 0; i < 15; i++) {
      // 随机位置（避开中心区域）
      let x, y;
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
      } while (Phaser.Math.Distance.Between(x, y, this.centerX, this.centerY) < 100);

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.95);
      
      this.balls.push(ball);
    }

    // 小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;
    let minDistance = Infinity;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 更新统计数据
      totalDistance += distance;
      if (distance < minDistance) {
        minDistance = distance;
      }

      // 避免除零和过强的引力
      const safeDistance = Math.max(distance, 20);

      // 计算引力大小：基准速度 / 距离
      const gravityForce = this.baseGravitySpeed / safeDistance;

      // 计算朝向中心的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 计算引力在 x 和 y 方向的分量
      const gravityX = Math.cos(angle) * gravityForce;
      const gravityY = Math.sin(angle) * gravityForce;

      // 应用引力加速度（使用 setAcceleration 更平滑）
      ball.setAcceleration(gravityX * 10, gravityY * 10);

      // 或者直接设置速度（更直接的效果）
      // const currentVelX = ball.body.velocity.x;
      // const currentVelY = ball.body.velocity.y;
      // ball.setVelocity(currentVelX + gravityX * delta * 0.001, currentVelY + gravityY * delta * 0.001);
    });

    // 更新状态信号
    this.averageDistance = totalDistance / this.balls.length;
    this.closestDistance = minDistance;

    // 显示状态信息
    this.statusText.setText([
      `Balls: ${this.balls.length}`,
      `Avg Distance: ${this.averageDistance.toFixed(1)}`,
      `Closest: ${this.closestDistance.toFixed(1)}`,
      `Gravity Base: ${this.baseGravitySpeed}`
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