class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号：碰撞计数
    this.ballCount = 10; // 小球数量
  }

  preload() {
    // 使用 Graphics 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理组
    this.balls = this.physics.add.group({
      defaultKey: 'blueBall',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建 10 个小球并设置随机位置和速度
    for (let i = 0; i < this.ballCount; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const ball = this.balls.create(x, y, 'blueBall');
      
      // 设置随机方向的速度，速度大小为 200
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 200;
      const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 200;
      
      ball.setVelocity(velocityX, velocityY);
      ball.setCircle(16); // 设置圆形碰撞体
    }

    // 启用小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 创建信息文本显示碰撞次数
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建边界线条用于可视化
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加计数器
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新信息显示
    this.infoText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 200 px/s`
    ]);
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

new Phaser.Game(config);