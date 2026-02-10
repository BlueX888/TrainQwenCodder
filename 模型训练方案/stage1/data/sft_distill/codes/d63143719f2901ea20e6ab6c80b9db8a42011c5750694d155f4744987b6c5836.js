class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.centerX = 400;
    this.centerY = 300;
    this.baseSpeed = 160;
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
    centerGraphics.generateTexture('centerPoint', 32, 32);
    centerGraphics.destroy();

    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(12, 12, 12);
    ballGraphics.generateTexture('ball', 24, 24);
    ballGraphics.destroy();

    // 显示中心点
    this.centerPoint = this.add.image(this.centerX, this.centerY, 'centerPoint');

    // 创建3个小球数组
    this.balls = [];
    
    // 随机位置创建小球
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 200 },
      { x: 400, y: 500 }
    ];

    positions.forEach((pos, index) => {
      const ball = this.physics.add.sprite(pos.x, pos.y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.1);
      
      // 给每个小球一个初始随机速度
      const randomAngle = Phaser.Math.Between(0, 360);
      const randomSpeed = Phaser.Math.Between(50, 100);
      this.physics.velocityFromAngle(randomAngle, randomSpeed, ball.body.velocity);
      
      this.balls.push(ball);
    });

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, '3个小球受中心黄点吸引，吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      totalDistance += distance;

      // 避免除以零，设置最小距离
      const effectiveDistance = Math.max(distance, 10);

      // 计算吸引力大小：速度基准 / 距离
      const attractionForce = this.baseSpeed / effectiveDistance;

      // 计算从小球指向中心点的角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );

      // 计算吸引力在 x 和 y 方向的分量
      const forceX = Math.cos(angle) * attractionForce;
      const forceY = Math.sin(angle) * attractionForce;

      // 应用加速度（delta 转换为秒）
      const deltaSeconds = delta / 1000;
      ball.body.velocity.x += forceX * deltaSeconds * 60;
      ball.body.velocity.y += forceY * deltaSeconds * 60;

      // 限制最大速度，防止过快
      const maxSpeed = 400;
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      if (currentSpeed > maxSpeed) {
        ball.body.velocity.x = (ball.body.velocity.x / currentSpeed) * maxSpeed;
        ball.body.velocity.y = (ball.body.velocity.y / currentSpeed) * maxSpeed;
      }
    });

    // 计算平均距离（状态信号）
    this.averageDistance = Math.round(totalDistance / this.balls.length);

    // 更新状态文本
    this.statusText.setText([
      `平均距离: ${this.averageDistance}`,
      `吸引速度基准: ${this.baseSpeed}`,
      `小球数量: ${this.balls.length}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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