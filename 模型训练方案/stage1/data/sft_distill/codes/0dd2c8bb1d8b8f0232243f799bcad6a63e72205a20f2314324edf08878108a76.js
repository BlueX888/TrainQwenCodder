class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证状态：碰撞计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('orangeBall', 32, 32);
    graphics.destroy();

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      key: 'orangeBall',
      repeat: 2, // 创建3个小球（1个初始 + 2个重复）
      setXY: {
        x: 200,
        y: 200,
        stepX: 200 // 水平间隔200像素
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball) => {
      // 设置弹性系数（完全弹性碰撞）
      ball.setBounce(1, 1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度方向，保持速度大小为120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 120;
      const velocityY = Math.sin(angle) * 120;
      ball.setVelocity(velocityX, velocityY);
      
      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数（调试信息）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示边界提示
    const bounds = this.physics.world.bounds;
    const boundsGraphics = this.add.graphics();
    boundsGraphics.lineStyle(2, 0xffffff, 0.5);
    boundsGraphics.strokeRect(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height
    );
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调：增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 可选：确保速度保持在120左右（考虑浮点误差）
    this.balls.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过5%，重新归一化
      if (Math.abs(currentSpeed - 120) > 6) {
        const scale = 120 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false // 设置为 true 可查看碰撞体
    }
  },
  scene: GameScene
};

new Phaser.Game(config);