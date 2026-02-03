class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.ballsActive = 0; // 状态信号：活跃小球数量
  }

  preload() {
    // 使用 Graphics 创建青色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理精灵组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: 11, // 创建12个小球（0-11）
      setXY: {
        x: 100,
        y: 100,
        stepX: 60,
        stepY: 60
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball) => {
      // 设置完全弹性碰撞
      ball.setBounce(1, 1);
      
      // 启用世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度方向，总速度为300
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 300;
      const velocityY = Math.sin(angle) * 300;
      ball.setVelocity(velocityX, velocityY);
      
      // 设置阻尼为0，保持速度恒定
      ball.setDamping(true);
      ball.setDrag(0);
    });

    // 启用小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleCollision, null, this);

    // 更新活跃小球数量
    this.ballsActive = this.balls.getLength();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界碰撞监听
    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
    });
  }

  handleCollision(ball1, ball2) {
    // 碰撞回调函数
    this.collisionCount++;
    
    // 确保碰撞后速度保持在300左右
    this.maintainSpeed(ball1);
    this.maintainSpeed(ball2);
  }

  maintainSpeed(ball) {
    // 保持小球速度恒定为300
    const currentSpeed = Math.sqrt(
      ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
    );
    
    if (currentSpeed > 0 && Math.abs(currentSpeed - 300) > 10) {
      const scale = 300 / currentSpeed;
      ball.setVelocity(
        ball.body.velocity.x * scale,
        ball.body.velocity.y * scale
      );
    }
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Active Balls: ${this.ballsActive}`,
      `Total Collisions: ${this.collisionCount}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 定期检查并修正小球速度
    if (time % 100 < delta) {
      this.balls.children.iterate((ball) => {
        this.maintainSpeed(ball);
      });
    }
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