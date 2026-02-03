class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.averageSpeed = 0; // 状态信号：平均速度
    this.totalFrames = 0; // 状态信号：总帧数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // 定义中心点
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.attractionBaseSpeed = 300; // 吸引速度基准
    
    // 绘制中心点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xffff00, 1);
    centerGraphics.fillCircle(this.centerX, this.centerY, 10);
    
    // 使用 Graphics 创建小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00aaff, 1);
    ballGraphics.fillCircle(15, 15, 15);
    ballGraphics.generateTexture('ball', 30, 30);
    ballGraphics.destroy();
    
    // 创建5个小球数组
    this.balls = [];
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 }
    ];
    
    for (let i = 0; i < 5; i++) {
      const ball = this.physics.add.sprite(
        positions[i].x,
        positions[i].y,
        'ball'
      );
      
      // 设置物理属性
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      ball.setDamping(true);
      ball.setDrag(0.99); // 轻微阻力，让运动更自然
      
      // 给小球初始随机速度
      ball.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      
      this.balls.push(ball);
    }
    
    // 添加调试信息文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    let totalSpeed = 0;
    
    // 对每个小球应用向心吸引力
    this.balls.forEach((ball, index) => {
      // 计算到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x,
        ball.y,
        this.centerX,
        this.centerY
      );
      
      // 避免除以零，设置最小距离
      const safeDistance = Math.max(distance, 50);
      
      // 计算吸引力（与距离成反比）
      const attractionForce = this.attractionBaseSpeed / safeDistance;
      
      // 计算从小球指向中心的方向向量
      const angle = Phaser.Math.Angle.Between(
        ball.x,
        ball.y,
        this.centerX,
        this.centerY
      );
      
      // 计算吸引力在 x 和 y 方向的分量
      const forceX = Math.cos(angle) * attractionForce * delta;
      const forceY = Math.sin(angle) * attractionForce * delta;
      
      // 应用力到小球的速度
      ball.setVelocity(
        ball.body.velocity.x + forceX,
        ball.body.velocity.y + forceY
      );
      
      // 限制最大速度，避免小球过快
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
      
      // 累加速度用于计算平均值
      totalSpeed += currentSpeed;
    });
    
    // 更新状态信号
    this.averageSpeed = totalSpeed / this.balls.length;
    this.totalFrames++;
    
    // 更新调试信息
    this.debugText.setText([
      `Average Speed: ${this.averageSpeed.toFixed(2)}`,
      `Total Frames: ${this.totalFrames}`,
      `Attraction Base: ${this.attractionBaseSpeed}`,
      `Active Balls: ${this.balls.length}`
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
      gravity: { y: 0 }, // 禁用默认重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

// 创建游戏实例
const game = new Phaser.Game(config);