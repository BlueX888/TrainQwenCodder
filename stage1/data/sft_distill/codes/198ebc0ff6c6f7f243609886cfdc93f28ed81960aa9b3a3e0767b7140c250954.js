class GravityFieldScene extends Phaser.Scene {
  constructor() {
    super('GravityFieldScene');
    this.activeBalls = 0; // 状态信号：活跃小球数量
    this.totalBalls = 20;
    this.attractionBase = 120; // 吸引速度基准
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建中心吸引点
    this.centerX = width / 2;
    this.centerY = height / 2;
    
    // 生成小球纹理
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00aaff, 1);
    ballGraphics.fillCircle(10, 10, 10);
    ballGraphics.generateTexture('ball', 20, 20);
    ballGraphics.destroy();
    
    // 生成中心点纹理
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(15, 15, 15);
    centerGraphics.lineStyle(2, 0xffffff, 1);
    centerGraphics.strokeCircle(15, 15, 15);
    centerGraphics.generateTexture('center', 30, 30);
    centerGraphics.destroy();
    
    // 创建中心点显示
    this.centerPoint = this.add.image(this.centerX, this.centerY, 'center');
    
    // 创建小球组
    this.balls = this.physics.add.group();
    
    // 在随机位置创建20个小球
    for (let i = 0; i < this.totalBalls; i++) {
      // 随机位置，避开中心区域
      let x, y;
      do {
        x = Phaser.Math.Between(50, width - 50);
        y = Phaser.Math.Between(50, height - 50);
      } while (Phaser.Math.Distance.Between(x, y, this.centerX, this.centerY) < 100);
      
      const ball = this.balls.create(x, y, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(0.8);
      
      // 设置初始随机速度
      ball.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
    }
    
    this.activeBalls = this.totalBalls;
    
    // 创建信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 添加说明文本
    this.add.text(10, height - 60, 
      '重力场效果演示\n红色中心点吸引蓝色小球\n吸引力与距离成反比', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 更新每个小球受到的吸引力
    this.balls.children.entries.forEach(ball => {
      // 计算小球到中心点的距离
      const distance = Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );
      
      // 防止距离过小导致吸引力过大
      const safeDist = Math.max(distance, 30);
      
      // 计算吸引力大小（与距离成反比）
      const attractionForce = this.attractionBase / safeDist;
      
      // 计算从小球指向中心的方向向量
      const angle = Phaser.Math.Angle.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );
      
      // 计算吸引力在x和y方向的分量
      const forceX = Math.cos(angle) * attractionForce;
      const forceY = Math.sin(angle) * attractionForce;
      
      // 应用吸引力到速度（累加而非替换）
      ball.setVelocity(
        ball.body.velocity.x + forceX,
        ball.body.velocity.y + forceY
      );
      
      // 限制最大速度，防止速度无限增长
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
    });
    
    // 更新状态信息
    this.updateInfo();
  }

  updateInfo() {
    // 计算平均距离
    let totalDistance = 0;
    this.balls.children.entries.forEach(ball => {
      totalDistance += Phaser.Math.Distance.Between(
        ball.x, ball.y,
        this.centerX, this.centerY
      );
    });
    
    const avgDistance = totalDistance / this.activeBalls;
    
    this.infoText.setText([
      `活跃小球: ${this.activeBalls}/${this.totalBalls}`,
      `吸引基准: ${this.attractionBase}`,
      `平均距离: ${Math.round(avgDistance)}px`
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
      gravity: { y: 0 }, // 不使用全局重力
      debug: false
    }
  },
  scene: GravityFieldScene
};

// 创建游戏实例
new Phaser.Game(config);