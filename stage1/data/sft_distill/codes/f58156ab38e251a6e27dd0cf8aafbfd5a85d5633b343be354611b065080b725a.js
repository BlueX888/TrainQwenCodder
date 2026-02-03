class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 20;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建紫色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('purpleBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.ballGroup = this.physics.add.group({
      key: 'purpleBall',
      repeat: this.ballCount - 1, // 总共20个
      setXY: {
        x: Phaser.Math.Between(50, width - 50),
        y: Phaser.Math.Between(50, height - 50),
        stepX: 0,
        stepY: 0
      }
    });

    // 为每个小球设置属性
    this.ballGroup.children.iterate((ball) => {
      // 随机生成角度
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 300;
      
      // 设置速度
      ball.body.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // 设置完全弹性碰撞
      ball.setBounce(1, 1);

      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);

      // 设置圆形碰撞体（更精确）
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.ballGroup, this.ballGroup, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加调试信息（可选）
    console.log('游戏启动：20个紫色小球已创建');
  }

  onBallCollision(ball1, ball2) {
    // 碰撞计数器递增
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `小球数量: ${this.ballCount}`,
      `碰撞次数: ${this.collisionCount}`,
      `速度: 300`
    ]);
  }

  update(time, delta) {
    // 可选：限制速度防止累积误差
    this.ballGroup.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差过大，重新归一化到300
      if (Math.abs(currentSpeed - 300) > 10) {
        const scale = 300 / currentSpeed;
        ball.body.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false // 设置为true可查看碰撞体
    }
  },
  scene: BallBounceScene
};

// 启动游戏
const game = new Phaser.Game(config);