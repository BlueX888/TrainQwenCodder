class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证状态：碰撞计数
    this.ballCount = 10; // 可验证状态：小球数量
  }

  preload() {
    // 使用 Graphics 创建蓝色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);
    
    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'blueBall',
      repeat: this.ballCount - 1,
      setXY: {
        x: Phaser.Math.Between(50, 750),
        y: Phaser.Math.Between(50, 550),
        stepX: 0,
        stepY: 0
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball) => {
      // 设置随机速度（速度为200）
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 200;
      const velocityY = Math.sin(angle) * 200;
      
      ball.setVelocity(velocityX, velocityY);
      
      // 设置弹性系数为1（完全弹性碰撞）
      ball.setBounce(1, 1);
      
      // 启用与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体（更精确）
      ball.body.setCircle(16);
    });

    // 启用小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界框（可视化）
    const boundaryGraphics = this.add.graphics();
    boundaryGraphics.lineStyle(2, 0xffffff, 1);
    boundaryGraphics.strokeRect(0, 0, 800, 600);

    console.log('Game initialized with', this.ballCount, 'balls');
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调：增加碰撞计数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `FPS: ${Math.round(this.game.loop.actualFps)}`
    ]);

    // 验证所有小球速度保持在200左右（考虑浮点误差）
    this.balls.children.iterate((ball) => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      
      // 如果速度偏离过大，重新归一化（防止浮点累积误差）
      if (Math.abs(speed - 200) > 5) {
        const factor = 200 / speed;
        ball.setVelocity(
          ball.body.velocity.x * factor,
          ball.body.velocity.y * factor
        );
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);