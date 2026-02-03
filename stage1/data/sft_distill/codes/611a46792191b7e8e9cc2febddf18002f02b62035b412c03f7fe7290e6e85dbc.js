class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerPoint = null;
    this.averageDistance = 0; // 状态信号：平均距离
    this.attractionSpeed = 300; // 吸引速度基准
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;

    // 创建中心点纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(16, 16, 16);
    centerGraphics.generateTexture('centerTex', 32, 32);
    centerGraphics.destroy();

    // 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(12, 12, 12);
    ballGraphics.generateTexture('ballTex', 24, 24);
    ballGraphics.destroy();

    // 创建中心点（静态显示，不参与物理）
    this.centerPoint = this.add.sprite(centerX, centerY, 'centerTex');
    
    // 创建8个小球物理精灵
    for (let i = 0; i < 8; i++) {
      // 随机生成小球位置（避免太靠近中心）
      const angle = (Math.PI * 2 / 8) * i;
      const distance = Phaser.Math.Between(150, 300);
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      const ball = this.physics.add.sprite(x, y, 'ballTex');
      
      // 设置小球物理属性
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.95);
      
      // 给小球一个初始速度（模拟轨道运动）
      const perpAngle = angle + Math.PI / 2;
      ball.setVelocity(
        Math.cos(perpAngle) * 100,
        Math.sin(perpAngle) * 100
      );

      this.balls.push(ball);
    }

    // 添加信息文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, '8个绿色小球受中心红点吸引\n吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    const centerX = this.centerPoint.x;
    const centerY = this.centerPoint.y;
    
    let totalDistance = 0;

    // 对每个小球应用引力
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离和方向
      const dx = centerX - ball.x;
      const dy = centerY - ball.y;
      const distance = Phaser.Math.Distance.Between(ball.x, ball.y, centerX, centerY);
      
      totalDistance += distance;

      // 避免除以零和距离过小时力过大
      if (distance > 20) {
        // 计算单位方向向量
        const dirX = dx / distance;
        const dirY = dy / distance;

        // 吸引力与距离成反比：force = attractionSpeed / distance
        // 转换为速度增量：deltaV = force * delta / 1000
        const force = this.attractionSpeed / distance;
        const acceleration = force * (delta / 1000);

        // 应用吸引力（增加朝向中心的速度）
        ball.setVelocity(
          ball.body.velocity.x + dirX * acceleration * 60,
          ball.body.velocity.y + dirY * acceleration * 60
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
      }
    });

    // 计算平均距离（状态信号）
    this.averageDistance = totalDistance / this.balls.length;

    // 更新信息显示
    this.infoText.setText(
      `吸引速度基准: ${this.attractionSpeed}\n` +
      `平均距离: ${this.averageDistance.toFixed(1)}\n` +
      `小球数量: ${this.balls.length}`
    );
  }
}

// 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);