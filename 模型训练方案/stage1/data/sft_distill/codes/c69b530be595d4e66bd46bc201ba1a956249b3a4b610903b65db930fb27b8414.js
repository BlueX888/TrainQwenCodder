class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态验证信号：碰撞计数
    this.balls = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建3个小球
    const ballPositions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 400 }
    ];

    ballPositions.forEach((pos, index) => {
      const ball = this.balls.create(pos.x, pos.y, 'ball');
      ball.setCircle(16); // 设置圆形碰撞体
      
      // 设置随机方向的速度，速度大小为240
      const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
      const velocityX = Math.cos(angle) * 240;
      const velocityY = Math.sin(angle) * 240;
      ball.setVelocity(velocityX, velocityY);
      
      // 设置完全弹性碰撞
      ball.setBounce(1, 1);
      ball.setCollideWorldBounds(true);
      
      // 防止摩擦导致速度衰减
      ball.body.setDamping(false);
      ball.body.useDamping = false;
    });

    // 添加球体之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, null, this);

    // 显示碰撞计数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示速度信息（用于验证）
    this.velocityText = this.add.text(10, 40, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  handleBallCollision(ball1, ball2) {
    // 碰撞发生时增加计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
    
    // 确保碰撞后速度保持在240左右（处理浮点误差）
    this.normalizeVelocity(ball1.body);
    this.normalizeVelocity(ball2.body);
  }

  normalizeVelocity(body) {
    const targetSpeed = 240;
    const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    
    if (currentSpeed > 0 && Math.abs(currentSpeed - targetSpeed) > 1) {
      const scale = targetSpeed / currentSpeed;
      body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
    }
  }

  update(time, delta) {
    // 更新速度显示（用于验证状态）
    let velocityInfo = 'Ball Speeds:\n';
    this.balls.children.entries.forEach((ball, index) => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      velocityInfo += `Ball ${index + 1}: ${speed.toFixed(1)}\n`;
      
      // 持续修正速度以保持240
      this.normalizeVelocity(ball.body);
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
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);