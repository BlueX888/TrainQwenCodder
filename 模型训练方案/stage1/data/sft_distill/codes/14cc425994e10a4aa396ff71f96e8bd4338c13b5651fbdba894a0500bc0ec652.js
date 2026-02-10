class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttractionSpeed = 160;
    
    // 状态信号
    this.averageSpeed = 0;
    this.averageDistance = 0;
    this.frameCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 8);
    centerGraphics.lineStyle(2, 0xff0000, 0.3);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 150);

    // 使用 Graphics 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00aaff, 1);
    ballGraphics.fillCircle(10, 10, 10);
    ballGraphics.generateTexture('ball', 20, 20);
    ballGraphics.destroy();

    // 创建20个小球
    for (let i = 0; i < 20; i++) {
      // 随机位置（避免太靠近中心）
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 200;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球初始随机速度
      const initialVelX = (Math.random() - 0.5) * 100;
      const initialVelY = (Math.random() - 0.5) * 100;
      ball.setVelocity(initialVelX, initialVelY);

      this.balls.push(ball);
    }

    // 添加小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    this.frameCount++;
    
    let totalSpeed = 0;
    let totalDistance = 0;

    // 对每个小球应用重力吸引
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 防止除零和过强的吸引力
      const safeDist = Math.max(distance, 20);

      // 计算方向向量
      const dirX = (this.centerX - ball.x) / safeDist;
      const dirY = (this.centerY - ball.y) / safeDist;

      // 计算吸引力强度（与距离成反比）
      const attractionForce = this.baseAttractionSpeed / safeDist;

      // 应用吸引力到速度
      const accelerationX = dirX * attractionForce * 60 * (delta / 1000);
      const accelerationY = dirY * attractionForce * 60 * (delta / 1000);

      ball.setVelocity(
        ball.body.velocity.x + accelerationX,
        ball.body.velocity.y + accelerationY
      );

      // 限制最大速度，防止失控
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

      // 统计数据
      totalSpeed += currentSpeed;
      totalDistance += distance;
    });

    // 更新状态信号
    this.averageSpeed = totalSpeed / this.balls.length;
    this.averageDistance = totalDistance / this.balls.length;

    // 每30帧更新一次显示
    if (this.frameCount % 30 === 0) {
      this.statusText.setText([
        `Balls: ${this.balls.length}`,
        `Avg Speed: ${this.averageSpeed.toFixed(2)}`,
        `Avg Distance: ${this.averageDistance.toFixed(2)}`,
        `Base Attraction: ${this.baseAttractionSpeed}`,
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
      gravity: { y: 0 },  // 关闭全局重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);