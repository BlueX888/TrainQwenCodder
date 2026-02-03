class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 3;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色球体纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('orangeBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group();

    // 创建3个小球
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const ball = this.balls.create(x, y, 'orangeBall');
      
      // 设置随机速度方向，速度大小为120
      const angle = Phaser.Math.Between(0, 360);
      const velocity = this.physics.velocityFromAngle(angle, 120);
      ball.setVelocity(velocity.x, velocity.y);
      
      // 设置边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置完全弹性碰撞（反弹系数为1）
      ball.setBounce(1, 1);
      
      // 设置圆形碰撞体
      ball.setCircle(16);
    }

    // 设置球体之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示球体速度信息（用于验证速度恒定）
    this.speedText = this.add.text(10, 40, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 绘制边界提示
    const border = this.add.graphics();
    border.lineStyle(2, 0xFFFFFF, 0.5);
    border.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞计数器递增
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 更新速度显示（验证速度保持在120左右）
    let speedInfo = 'Speeds: ';
    this.balls.getChildren().forEach((ball, index) => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      speedInfo += `Ball${index + 1}: ${speed.toFixed(1)} `;
    });
    this.speedText.setText(speedInfo);
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