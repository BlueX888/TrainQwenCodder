class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.ballCount = 12; // 小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ballTexture', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ballTexture',
      repeat: this.ballCount - 1, // 创建12个小球
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个小球的随机位置和速度
    const ballSpeed = 80;
    this.balls.children.iterate((ball) => {
      // 随机位置（避免太靠近边缘）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      ball.setPosition(x, y);

      // 随机速度方向
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * ballSpeed;
      const vy = Math.sin(angle) * ballSpeed;
      ball.setVelocity(vx, vy);

      // 设置圆形碰撞体
      ball.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 添加信息文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界可视化
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0x00ff00, 1);
    bounds.strokeRect(0, 0, 800, 600);

    this.updateInfo();
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加计数器
    this.collisionCount++;
  }

  update(time, delta) {
    this.updateInfo();
  }

  updateInfo() {
    // 更新状态信息
    const info = [
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 80 px/s`
    ];
    this.infoText.setText(info.join('\n'));
  }
}

// 游戏配置
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
  scene: BallBounceScene
};

// 创建游戏实例
const game = new Phaser.Game(config);