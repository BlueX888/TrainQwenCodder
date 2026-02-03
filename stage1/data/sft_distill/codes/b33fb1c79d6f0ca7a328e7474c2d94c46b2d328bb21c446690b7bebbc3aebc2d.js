class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseAttractionSpeed = 200;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('ballTex', 20, 20);
    graphics.destroy();

    // 创建中心吸引点标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 8);
    centerGraphics.lineStyle(2, 0xff0000, 0.5);
    centerGraphics.strokeCircle(this.centerX, this.centerY, 15);

    // 创建10个小球
    for (let i = 0; i < 10; i++) {
      // 随机位置，避免太靠近中心
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.FloatBetween(150, 350);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ballTex');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球一些初始速度（切向速度）
      const tangentAngle = angle + Math.PI / 2;
      ball.setVelocity(
        Math.cos(tangentAngle) * 50,
        Math.sin(tangentAngle) * 50
      );

      this.balls.push(ball);
    }

    // 初始化验证信号
    window.__signals__ = {
      frameCount: 0,
      balls: [],
      centerX: this.centerX,
      centerY: this.centerY,
      baseAttractionSpeed: this.baseAttractionSpeed
    };

    // 添加说明文字
    this.add.text(10, 10, 'Gravity Field: 10 balls attracted to center', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.add.text(10, 30, 'Attraction Speed: 200 / distance', {
      fontSize: '14px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;

    // 更新每个小球的吸引力
    this.balls.forEach((ball, index) => {
      // 计算到中心点的距离和角度
      const dx = this.centerX - ball.x;
      const dy = this.centerY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 避免除以零和距离太近时的过大加速度
      if (distance > 20) {
        // 计算吸引力大小：基准速度 / 距离
        const attractionForce = this.baseAttractionSpeed / distance;

        // 计算单位方向向量
        const dirX = dx / distance;
        const dirY = dy / distance;

        // 应用吸引力到速度（加速度效果）
        const accelerationX = dirX * attractionForce * deltaSeconds * 60;
        const accelerationY = dirY * attractionForce * deltaSeconds * 60;

        ball.setVelocity(
          ball.body.velocity.x + accelerationX,
          ball.body.velocity.y + accelerationY
        );

        // 限制最大速度，避免速度过大
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
      }

      // 记录球的状态用于验证
      if (window.__signals__.balls[index] === undefined) {
        window.__signals__.balls[index] = {};
      }
      window.__signals__.balls[index] = {
        x: Math.round(ball.x * 10) / 10,
        y: Math.round(ball.y * 10) / 10,
        velocityX: Math.round(ball.body.velocity.x * 10) / 10,
        velocityY: Math.round(ball.body.velocity.y * 10) / 10,
        distanceToCenter: Math.round(distance * 10) / 10,
        attractionForce: distance > 20 ? Math.round((this.baseAttractionSpeed / distance) * 10) / 10 : 0
      };
    });

    // 更新帧计数
    window.__signals__.frameCount++;

    // 每60帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frameCount,
        avgDistance: Math.round(
          window.__signals__.balls.reduce((sum, b) => sum + b.distanceToCenter, 0) / 10 * 10
        ) / 10,
        ballsMoving: window.__signals__.balls.filter(b => 
          Math.abs(b.velocityX) > 1 || Math.abs(b.velocityY) > 1
        ).length
      }));
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