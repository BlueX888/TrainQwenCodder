class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 5;
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('pinkBall', 32, 32);
    graphics.destroy();

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建5个小球并设置随机速度
    const speed = 160;
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免初始重叠）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const ball = this.balls.create(x, y, 'pinkBall');
      ball.setCircle(16); // 设置圆形碰撞体
      
      // 随机方向的速度，总速度为160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);
    }

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数器
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示小球速度信息
    this.speedText = this.add.text(10, 50, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界提示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调，增加计数器
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 显示所有小球的速度信息（验证速度保持在160左右）
    let speedInfo = 'Ball Speeds:\n';
    this.balls.getChildren().forEach((ball, index) => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      speedInfo += `Ball ${index + 1}: ${speed.toFixed(1)}\n`;
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