class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞次数
    this.balls = [];
  }

  preload() {
    // 使用 Graphics 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('orangeBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建 3 个橙色小球
    const ballPositions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 400 }
    ];

    for (let i = 0; i < 3; i++) {
      const ball = this.physics.add.sprite(
        ballPositions[i].x,
        ballPositions[i].y,
        'orangeBall'
      );

      // 设置完全弹性碰撞（反弹系数为1）
      ball.setBounce(1, 1);
      
      // 启用世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度方向，但保持总速度为120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 120;
      const velocityY = Math.sin(angle) * 120;
      ball.setVelocity(velocityX, velocityY);
      
      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.body.setCircle(16);
      
      this.balls.push(ball);
    }

    // 设置球体之间的碰撞检测
    this.physics.add.collider(this.balls[0], this.balls[1], this.onBallCollision, null, this);
    this.physics.add.collider(this.balls[0], this.balls[2], this.onBallCollision, null, this);
    this.physics.add.collider(this.balls[1], this.balls[2], this.onBallCollision, null, this);

    // 显示碰撞计数器（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示速度信息（用于验证速度保持在120左右）
    this.velocityText = this.add.text(10, 40, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界框（可视化边界）
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xffffff, 1);
    borderGraphics.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调函数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 更新速度显示（用于验证）
    let velocityInfo = 'Ball Speeds:\n';
    this.balls.forEach((ball, index) => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      ).toFixed(1);
      velocityInfo += `Ball ${index + 1}: ${speed}\n`;
    });
    this.velocityText.setText(velocityInfo);
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
      debug: false // 设置为 true 可查看碰撞体边界
    }
  },
  scene: GameScene
};

new Phaser.Game(config);