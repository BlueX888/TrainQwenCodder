class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.worldCollisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('pinkBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'pinkBall',
      repeat: 11, // 总共12个球
      setXY: {
        x: 100,
        y: 100,
        stepX: 60,
        stepY: 60
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball) => {
      // 设置弹性系数（完全弹性碰撞）
      ball.setBounce(1, 1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度方向，总速度为200
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 200;
      const velocityY = Math.sin(angle) * 200;
      ball.setVelocity(velocityX, velocityY);
      
      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', () => {
      this.worldCollisionCount++;
    });

    // 启用世界边界事件
    this.balls.children.iterate((ball) => {
      ball.body.onWorldBounds = true;
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界可视化（可选）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 1);
    bounds.strokeRect(0, 0, this.sys.game.config.width, this.sys.game.config.height);
  }

  onBallCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Ball Collisions: ${this.collisionCount}`,
      `Wall Collisions: ${this.worldCollisionCount}`,
      `Active Balls: ${this.balls.countActive()}`
    ]);

    // 确保小球速度保持在200左右（防止浮点误差累积）
    this.balls.children.iterate((ball) => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过5%，进行修正
      if (Math.abs(currentSpeed - 200) > 10) {
        const scale = 200 / currentSpeed;
        body.velocity.x *= scale;
        body.velocity.y *= scale;
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
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);