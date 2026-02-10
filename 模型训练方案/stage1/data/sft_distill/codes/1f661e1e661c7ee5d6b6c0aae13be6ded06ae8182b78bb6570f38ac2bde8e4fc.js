class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.ballCount = 20;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'blueBall',
      repeat: this.ballCount - 1,
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 为每个小球设置随机速度和位置
    const speed = 200;
    this.balls.children.iterate((ball) => {
      // 随机位置（避免边缘）
      ball.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );

      // 随机方向，固定速度大小为200
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);

      // 设置弹性系数为1（完全弹性碰撞）
      ball.setBounce(1, 1);

      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 添加文字显示碰撞次数
    this.collisionText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化信号对象
    window.__signals__ = {
      ballCount: this.ballCount,
      collisionCount: 0,
      averageSpeed: speed,
      timestamp: Date.now()
    };

    this.updateDisplay();
  }

  onBallCollision(ball1, ball2) {
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;
    window.__signals__.timestamp = Date.now();
    
    // 每10次碰撞输出日志
    if (this.collisionCount % 10 === 0) {
      console.log(JSON.stringify({
        type: 'collision_milestone',
        count: this.collisionCount,
        time: Date.now()
      }));
    }
  }

  update(time, delta) {
    this.updateDisplay();

    // 计算平均速度
    let totalSpeed = 0;
    let count = 0;
    this.balls.children.iterate((ball) => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      );
      totalSpeed += speed;
      count++;
    });

    if (count > 0) {
      window.__signals__.averageSpeed = Math.round(totalSpeed / count);
    }

    // 每秒输出一次状态
    if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
      console.log(JSON.stringify({
        type: 'status_update',
        collisions: this.collisionCount,
        avgSpeed: window.__signals__.averageSpeed,
        activeBalls: count,
        time: Date.now()
      }));
    }
  }

  updateDisplay() {
    this.collisionText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Avg Speed: ${window.__signals__.averageSpeed}`
    ]);
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);