class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttraction = 80; // 基准吸引速度
    this.averageDistance = 0; // 状态信号：平均距离
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
    centerGraphics.fillCircle(this.centerX, this.centerY, 8);
    centerGraphics.lineStyle(2, 0xff0000, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 50);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 100);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 150);

    // 创建10个小球，随机分布在场景中
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i;
      const distance = 150 + Math.random() * 100;
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;
      
      const ball = this.physics.add.sprite(x, y, 'ballTex');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一些初始切向速度，形成轨道效果
      const tangentAngle = angle + Math.PI / 2;
      ball.setVelocity(
        Math.cos(tangentAngle) * 50,
        Math.sin(tangentAngle) * 50
      );
      
      this.balls.push(ball);
    }

    // 添加小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 560, '绿色小球受红色中心点引力吸引\n吸引力 = 80 / 距离', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

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

      // 计算吸引力（速度与距离成反比）
      // 添加最小距离限制，避免距离太近时速度过大
      const minDistance = 20;
      const effectiveDistance = Math.max(distance, minDistance);
      const attractionSpeed = this.baseAttraction / effectiveDistance;

      // 将吸引力转换为速度增量
      const deltaTime = delta / 1000; // 转换为秒
      const velocityDeltaX = Math.cos(angle) * attractionSpeed * 60 * deltaTime;
      const velocityDeltaY = Math.sin(angle) * attractionSpeed * 60 * deltaTime;

      // 应用速度增量
      ball.setVelocity(
        ball.body.velocity.x + velocityDeltaX,
        ball.body.velocity.y + velocityDeltaY
      );

      // 限制最大速度，避免速度过快
      const maxSpeed = 300;
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      if (currentSpeed > maxSpeed) {
        ball.setVelocity(
          ball.body.velocity.x * maxSpeed / currentSpeed,
          ball.body.velocity.y * maxSpeed / currentSpeed
        );
      }

      totalDistance += distance;
    });

    // 计算平均距离作为状态信号
    this.averageDistance = totalDistance / this.balls.length;

    // 更新状态显示
    this.statusText.setText(
      `小球数量: ${this.balls.length}\n` +
      `平均距离: ${this.averageDistance.toFixed(1)} px\n` +
      `吸引基准: ${this.baseAttraction}`
    );
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