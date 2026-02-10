class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号：碰撞计数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'yellowBall',
      repeat: 4, // 创建5个小球（0-4）
      setXY: {
        x: 100,
        y: 100,
        stepX: 150,
        stepY: 100
      }
    });

    // 设置每个小球的物理属性
    this.balls.children.iterate((ball) => {
      // 设置完全弹性碰撞
      ball.setBounce(1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度方向，速度大小为240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 240;
      const velocityY = Math.sin(angle) * 240;
      ball.setVelocity(velocityX, velocityY);
      
      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.handleCollision, null, this);

    // 显示碰撞计数（可验证状态）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示说明文字
    this.add.text(10, 40, 'Yellow balls bouncing with elastic collision', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 绘制边界提示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, this.cameras.main.width, this.cameras.main.height);
  }

  handleCollision(ball1, ball2) {
    // 碰撞回调函数，用于统计碰撞次数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 可选：显示小球速度信息（用于验证速度保持在240左右）
    if (time % 1000 < 16) { // 每秒更新一次
      this.balls.children.iterate((ball, index) => {
        const speed = Math.sqrt(
          ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
        );
        // 速度可能因浮点误差略有偏差，但应该接近240
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
      debug: false // 设为true可查看碰撞体
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);