class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttraction = 200;
    this.averageDistance = 0; // 状态信号：平均距离
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建中心点纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(16, 16, 16);
    centerGraphics.generateTexture('center', 32, 32);
    centerGraphics.destroy();

    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(10, 10, 10);
    ballGraphics.generateTexture('ball', 20, 20);
    ballGraphics.destroy();

    // 创建中心点（显示用，不参与物理）
    this.centerPoint = this.add.sprite(this.centerX, this.centerY, 'center');
    this.centerPoint.setAlpha(0.8);

    // 创建5个小球
    for (let i = 0; i < 5; i++) {
      // 随机位置，但不在中心附近
      const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
      const distance = Phaser.Math.Between(150, 250);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球初始随机速度
      const vx = Phaser.Math.Between(-50, 50);
      const vy = Phaser.Math.Between(-50, 50);
      ball.setVelocity(vx, vy);

      this.balls.push(ball);
    }

    // 添加文字显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用重力场效果
    this.balls.forEach((ball, index) => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      totalDistance += distance;

      // 防止除零错误，设置最小距离
      const safeDistance = Math.max(distance, 20);

      // 计算吸引力方向（从小球指向中心点的单位向量）
      const directionX = (this.centerX - ball.x) / safeDistance;
      const directionY = (this.centerY - ball.y) / safeDistance;

      // 计算吸引力大小（与距离成反比）
      const attractionForce = this.baseAttraction / safeDistance;

      // 应用吸引力到速度（累加而不是直接设置）
      const currentVelocity = ball.body.velocity;
      const newVelocityX = currentVelocity.x + directionX * attractionForce * (delta / 1000) * 60;
      const newVelocityY = currentVelocity.y + directionY * attractionForce * (delta / 1000) * 60;

      // 限制最大速度，防止速度过快
      const maxSpeed = 400;
      const speed = Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY);
      
      if (speed > maxSpeed) {
        ball.setVelocity(
          (newVelocityX / speed) * maxSpeed,
          (newVelocityY / speed) * maxSpeed
        );
      } else {
        ball.setVelocity(newVelocityX, newVelocityY);
      }

      // 根据距离调整小球透明度（越近越亮）
      const alpha = Math.max(0.3, Math.min(1, 300 / distance));
      ball.setAlpha(alpha);
    });

    // 计算平均距离（状态信号）
    this.averageDistance = totalDistance / this.balls.length;

    // 更新状态显示
    this.statusText.setText([
      `Gravity Field Demo`,
      `Average Distance: ${this.averageDistance.toFixed(1)}`,
      `Base Attraction: ${this.baseAttraction}`,
      `Balls: ${this.balls.length}`
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
      gravity: { y: 0 }, // 不使用全局重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);