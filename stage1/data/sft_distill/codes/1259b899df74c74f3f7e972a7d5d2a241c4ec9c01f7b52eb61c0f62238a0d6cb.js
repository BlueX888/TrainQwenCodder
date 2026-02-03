class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 1. 程序化生成白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('whiteBall', 32, 32);
    graphics.destroy();

    // 2. 创建物理组
    this.balls = this.physics.add.group({
      key: 'whiteBall',
      repeat: 14, // 总共15个物体（0-14）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 3. 设置每个物体的随机位置和速度
    const speed = 360;
    this.balls.children.iterate((ball) => {
      // 随机位置
      ball.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );

      // 随机方向的速度，总速度为360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);

      // 设置圆形碰撞体
      ball.body.setCircle(16);
    });

    // 4. 设置组内物体之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onCollision, null, this);

    // 5. 添加调试文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 添加物体数量显示
    this.countText = this.add.text(10, 40, 'Objects: 15', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  onCollision(ball1, ball2) {
    // 碰撞回调，增加计数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保所有物体保持恒定速度360
    this.balls.children.iterate((ball) => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏离360，重新归一化
      if (Math.abs(currentSpeed - 360) > 1) {
        const scale = 360 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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