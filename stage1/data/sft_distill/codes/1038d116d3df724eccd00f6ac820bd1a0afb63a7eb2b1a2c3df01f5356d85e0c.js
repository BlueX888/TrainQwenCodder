class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.attractionBase = 200; // 吸引速度基准
    
    // 状态信号
    this.averageSpeed = 0;
    this.closestDistance = 0;
    this.frameCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00aaff, 1);
    ballGraphics.fillCircle(10, 10, 10);
    ballGraphics.generateTexture('ball', 20, 20);
    ballGraphics.destroy();

    // 创建中心点纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(15, 15, 15);
    centerGraphics.lineStyle(2, 0xffff00, 1);
    centerGraphics.strokeCircle(15, 15, 15);
    centerGraphics.generateTexture('center', 30, 30);
    centerGraphics.destroy();

    // 创建中心点显示
    this.centerPoint = this.add.image(this.centerX, this.centerY, 'center');

    // 创建20个小球
    for (let i = 0; i < 20; i++) {
      // 随机位置，避免太靠近中心
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.FloatBetween(150, 350);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一个初始随机速度
      ball.setVelocity(
        Phaser.Math.FloatBetween(-50, 50),
        Phaser.Math.FloatBetween(-50, 50)
      );

      this.balls.push(ball);
    }

    // 小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls);

    // 创建信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制中心吸引力范围提示圈
    this.attractionCircle = this.add.graphics();
    this.attractionCircle.lineStyle(1, 0xff0000, 0.3);
    this.attractionCircle.strokeCircle(this.centerX, this.centerY, 100);
    this.attractionCircle.strokeCircle(this.centerX, this.centerY, 200);
    this.attractionCircle.strokeCircle(this.centerX, this.centerY, 300);
  }

  update(time, delta) {
    this.frameCount++;
    
    let totalSpeed = 0;
    let minDistance = Infinity;

    // 对每个小球应用重力场吸引
    this.balls.forEach(ball => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 记录最近距离
      if (distance < minDistance) {
        minDistance = distance;
      }

      // 防止距离为0导致除零错误
      if (distance < 1) return;

      // 计算吸引力方向（从小球指向中心点的单位向量）
      const dirX = (this.centerX - ball.x) / distance;
      const dirY = (this.centerY - ball.y) / distance;

      // 计算吸引力大小：基准速度 / 距离
      const attractionForce = this.attractionBase / distance;

      // 应用吸引力到速度（使用加速度方式）
      const acceleration = attractionForce * (delta / 1000); // 根据帧时间调整
      ball.setVelocity(
        ball.body.velocity.x + dirX * acceleration * 60,
        ball.body.velocity.y + dirY * acceleration * 60
      );

      // 限制最大速度，防止小球过快
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      totalSpeed += currentSpeed;

      const maxSpeed = 400;
      if (currentSpeed > maxSpeed) {
        const scale = maxSpeed / currentSpeed;
        ball.setVelocity(
          ball.body.velocity.x * scale,
          ball.body.velocity.y * scale
        );
      }
    });

    // 更新状态信号
    this.averageSpeed = totalSpeed / this.balls.length;
    this.closestDistance = minDistance;

    // 每10帧更新一次显示信息
    if (this.frameCount % 10 === 0) {
      this.infoText.setText([
        `重力场效果演示`,
        `小球数量: ${this.balls.length}`,
        `平均速度: ${this.averageSpeed.toFixed(2)}`,
        `最近距离: ${this.closestDistance.toFixed(2)}`,
        `吸引基准: ${this.attractionBase}`,
        `帧数: ${this.frameCount}`
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
      gravity: { y: 0 }, // 禁用全局重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

new Phaser.Game(config);