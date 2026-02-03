class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttractionSpeed = 300;
    // 状态信号
    this.averageSpeed = 0;
    this.minDistance = 0;
    this.frameCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    centerGraphics.lineStyle(2, 0xff0000, 0.3);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 150);

    // 使用Graphics创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00aaff, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture('ball', 16, 16);
    ballGraphics.destroy();

    // 创建12个小球
    for (let i = 0; i < 12; i++) {
      // 随机位置（避开中心区域）
      const angle = (i / 12) * Math.PI * 2;
      const distance = Phaser.Math.Between(150, 280);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一些初始速度（切向速度，形成轨道效果）
      const tangentAngle = angle + Math.PI / 2;
      const initialSpeed = Phaser.Math.Between(50, 100);
      ball.setVelocity(
        Math.cos(tangentAngle) * initialSpeed,
        Math.sin(tangentAngle) * initialSpeed
      );

      this.balls.push(ball);
    }

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    this.frameCount++;
    
    let totalSpeed = 0;
    let minDist = Infinity;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 记录最小距离
      if (distance < minDist) {
        minDist = distance;
      }

      // 避免除以零和过强的力
      const safeDistance = Math.max(distance, 20);

      // 计算吸引力大小（与距离成反比）
      const attractionForce = this.baseAttractionSpeed / safeDistance;

      // 计算方向单位向量
      const dirX = dx / distance;
      const dirY = dy / distance;

      // 应用吸引力到速度（每帧增加速度）
      const deltaSeconds = delta / 1000;
      ball.body.velocity.x += dirX * attractionForce * deltaSeconds * 60;
      ball.body.velocity.y += dirY * attractionForce * deltaSeconds * 60;

      // 限制最大速度，避免过快
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      totalSpeed += currentSpeed;

      const maxSpeed = 400;
      if (currentSpeed > maxSpeed) {
        ball.body.velocity.x = (ball.body.velocity.x / currentSpeed) * maxSpeed;
        ball.body.velocity.y = (ball.body.velocity.y / currentSpeed) * maxSpeed;
      }
    });

    // 更新状态信号
    this.averageSpeed = totalSpeed / this.balls.length;
    this.minDistance = minDist;

    // 每30帧更新一次显示
    if (this.frameCount % 30 === 0) {
      this.infoText.setText([
        `Balls: ${this.balls.length}`,
        `Average Speed: ${this.averageSpeed.toFixed(2)}`,
        `Min Distance: ${this.minDistance.toFixed(2)}`,
        `Attraction Base: ${this.baseAttractionSpeed}`,
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
      gravity: { y: 0 }, // 禁用默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);