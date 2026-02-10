class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.activeBalls = 0; // 状态信号：活跃小球数量
    this.totalAttractionForce = 0; // 状态信号：总吸引力
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 定义中心点位置
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.attractionSpeed = 80; // 吸引速度基准

    // 创建小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('ball', 20, 20);
    graphics.destroy();

    // 创建中心点标记纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(8, 8, 8);
    centerGraphics.lineStyle(2, 0xff0000, 1);
    centerGraphics.strokeCircle(8, 8, 15);
    centerGraphics.generateTexture('center', 16, 16);
    centerGraphics.destroy();

    // 显示中心点
    this.centerMarker = this.add.image(this.centerX, this.centerY, 'center');
    this.centerMarker.setDepth(10);

    // 创建 10 个小球
    this.balls = [];
    for (let i = 0; i < 10; i++) {
      // 随机位置，避免太靠近中心
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.FloatBetween(150, 300);
      const x = this.centerX + Math.cos(angle) * distance;
      const y = this.centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 给小球初始随机速度
      const initialVelX = Phaser.Math.FloatBetween(-50, 50);
      const initialVelY = Phaser.Math.FloatBetween(-50, 50);
      ball.setVelocity(initialVelX, initialVelY);
      
      // 设置阻尼，模拟空气阻力
      ball.setDamping(true);
      ball.setDrag(0.1);

      this.balls.push(ball);
    }

    this.activeBalls = this.balls.length;

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.infoText.setDepth(20);

    // 添加说明文本
    this.add.text(10, height - 40, '小球受中心红点吸引\n吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    // 绘制中心吸引区域提示圈
    this.attractionCircle = this.add.graphics();
    this.attractionCircle.lineStyle(1, 0xff0000, 0.3);
    this.attractionCircle.strokeCircle(this.centerX, this.centerY, 200);
    this.attractionCircle.setDepth(0);
  }

  update(time, delta) {
    this.totalAttractionForce = 0;

    // 对每个小球应用向心吸引力
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 防止距离为 0 导致除零错误
      if (distance < 1) return;

      // 计算方向向量（从小球指向中心）
      const directionX = (this.centerX - ball.x) / distance;
      const directionY = (this.centerY - ball.y) / distance;

      // 计算吸引力大小：力 = 基准速度 / 距离
      const forceMagnitude = this.attractionSpeed / distance;

      // 将吸引力应用到速度上（每帧累加）
      const accelerationX = directionX * forceMagnitude * (delta / 16);
      const accelerationY = directionY * forceMagnitude * (delta / 16);

      ball.setVelocity(
        ball.body.velocity.x + accelerationX,
        ball.body.velocity.y + accelerationY
      );

      // 限制最大速度，防止速度过快
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

      // 累计总吸引力（用于状态显示）
      this.totalAttractionForce += forceMagnitude;
    });

    // 更新信息显示
    const avgDistance = this.balls.reduce((sum, ball) => {
      return sum + Phaser.Math.Distance.Between(
        ball.x, ball.y, this.centerX, this.centerY
      );
    }, 0) / this.balls.length;

    this.infoText.setText([
      `活跃小球: ${this.activeBalls}`,
      `平均距离: ${Math.round(avgDistance)}`,
      `总吸引力: ${this.totalAttractionForce.toFixed(2)}`,
      `吸引基准: ${this.attractionSpeed}`
    ]);

    // 让中心点标记有呼吸效果
    const scale = 1 + Math.sin(time / 200) * 0.2;
    this.centerMarker.setScale(scale);
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 关闭默认重力，使用自定义吸引力
      debug: false
    }
  },
  scene: GravityFieldScene
};

// 创建游戏实例
new Phaser.Game(config);