class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.balls = [];
    this.centerX = 400;
    this.centerY = 300;
    this.baseSpeed = 160;
    this.averageDistance = 0; // 状态信号：平均距离
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

    // 使用 Graphics 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(16, 16, 16);
    ballGraphics.generateTexture('ball', 32, 32);
    ballGraphics.destroy();

    // 创建10个小球，随机分布在场景中
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.95);
      
      // 给小球一个初始随机速度
      const initialVelX = Phaser.Math.Between(-50, 50);
      const initialVelY = Phaser.Math.Between(-50, 50);
      ball.setVelocity(initialVelX, initialVelY);
      
      this.balls.push(ball);
    }

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 560, '绿色小球被红色中心点吸引（吸引力与距离成反比）', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    let totalDistance = 0;

    // 对每个小球应用重力场效果
    this.balls.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      totalDistance += distance;

      // 计算角度
      const angle = Phaser.Math.Angle.Between(
        ball.x, 
        ball.y, 
        this.centerX, 
        this.centerY
      );

      // 吸引力与距离成反比，避免除零和过大的力
      // 使用最小距离限制避免小球到达中心时速度过大
      const minDistance = 50;
      const effectiveDistance = Math.max(distance, minDistance);
      
      // 计算吸引力系数（距离越近，系数越大）
      const gravityStrength = this.baseSpeed / effectiveDistance;

      // 计算加速度分量（使用 delta 时间进行帧率独立）
      const deltaSeconds = delta / 1000;
      const accelerationX = Math.cos(angle) * gravityStrength * deltaSeconds * 60;
      const accelerationY = Math.sin(angle) * gravityStrength * deltaSeconds * 60;

      // 应用加速度到速度
      ball.setVelocity(
        ball.body.velocity.x + accelerationX,
        ball.body.velocity.y + accelerationY
      );

      // 限制最大速度，避免小球移动过快
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
    });

    // 计算平均距离作为状态信号
    this.averageDistance = totalDistance / this.balls.length;

    // 更新状态显示
    this.statusText.setText([
      `小球数量: ${this.balls.length}`,
      `平均距离: ${this.averageDistance.toFixed(2)}`,
      `基准速度: ${this.baseSpeed}`,
      `状态: 运行中`
    ]);
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