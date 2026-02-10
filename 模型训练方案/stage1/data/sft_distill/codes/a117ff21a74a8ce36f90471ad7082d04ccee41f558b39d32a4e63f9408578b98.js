class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('pinkBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.ballGroup = this.physics.add.group({
      key: 'pinkBall',
      repeat: 7, // 创建8个小球（1个基础 + 7个重复）
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 为每个小球设置位置和随机速度
    const balls = this.ballGroup.getChildren();
    balls.forEach((ball, index) => {
      // 均匀分布初始位置
      const x = 100 + (index % 4) * 200;
      const y = 100 + Math.floor(index / 4) * 400;
      ball.setPosition(x, y);

      // 设置随机方向的速度，速度大小为120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 120;
      const velocityY = Math.sin(angle) * 120;
      ball.setVelocity(velocityX, velocityY);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.ballGroup, this.ballGroup, this.onBallCollision, null, this);

    // 显示碰撞计数器
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示世界边界（用于调试）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 1);
    bounds.strokeRect(0, 0, this.physics.world.bounds.width, this.physics.world.bounds.height);

    console.log('Game started with 8 pink balls at speed 120');
  }

  onBallCollision(ball1, ball2) {
    // 每次碰撞增加计数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保所有小球速度保持在120左右（补偿浮点误差）
    const balls = this.ballGroup.getChildren();
    balls.forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏离120太多，进行修正
      if (Math.abs(currentSpeed - 120) > 5) {
        const scale = 120 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
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