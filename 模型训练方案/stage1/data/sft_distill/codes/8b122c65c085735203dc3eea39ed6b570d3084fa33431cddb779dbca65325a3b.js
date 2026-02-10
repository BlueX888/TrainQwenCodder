class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.activeBalls = 0; // 状态信号：活跃小球数量
    this.totalCollisions = 0; // 状态信号：总碰撞次数
  }

  preload() {
    // 使用 Graphics 生成灰色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x808080, 1);
    graphics.fillCircle(15, 15, 15);
    graphics.generateTexture('ball', 30, 30);
    graphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: 9, // 创建 10 个球（0-9）
      setXY: {
        x: Phaser.Math.Between(50, 750),
        y: Phaser.Math.Between(50, 550),
        stepX: 0,
        stepY: 0
      }
    });

    // 为每个小球设置属性
    this.balls.children.iterate((ball) => {
      // 设置完全弹性碰撞
      ball.setBounce(1, 1);
      
      // 设置碰撞边界
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度方向，总速度为 360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 360;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);
      
      // 设置圆形碰撞体
      ball.body.setCircle(15);
      
      // 避免小球卡在一起
      ball.body.setMaxVelocity(360, 360);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 创建信息文本显示状态
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界框（可视化）
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xffffff, 1);
    borderGraphics.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调：记录碰撞次数
    this.totalCollisions++;
  }

  update(time, delta) {
    // 更新活跃小球数量
    this.activeBalls = this.balls.countActive(true);

    // 确保小球速度保持在 360 左右（防止物理引擎误差累积）
    this.balls.children.iterate((ball) => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差过大，进行修正
      if (Math.abs(currentSpeed - 360) > 10) {
        const scale = 360 / currentSpeed;
        body.velocity.x *= scale;
        body.velocity.y *= scale;
      }
    });

    // 更新信息显示
    this.infoText.setText([
      `Active Balls: ${this.activeBalls}`,
      `Total Collisions: ${this.totalCollisions}`,
      `FPS: ${Math.round(this.game.loop.actualFps)}`
    ]);
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
      debug: false
    }
  },
  scene: BallBounceScene
};

// 创建游戏实例
new Phaser.Game(config);