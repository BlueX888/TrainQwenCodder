class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.objectCount = 10;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.sys.game.config;

    // 使用 Graphics 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('cyanBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.cyanGroup = this.physics.add.group({
      defaultKey: 'cyanBall',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建 10 个青色物体
    for (let i = 0; i < this.objectCount; i++) {
      // 随机位置（避免边界太近）
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      
      const ball = this.cyanGroup.create(x, y, 'cyanBall');
      
      // 设置随机方向的速度，速度大小为 360
      const angle = Phaser.Math.Between(0, 360);
      const velocity = this.physics.velocityFromAngle(angle, 360);
      ball.setVelocity(velocity.x, velocity.y);
    }

    // 启用组内物体之间的碰撞
    this.physics.add.collider(this.cyanGroup, this.cyanGroup, this.onCollision, null, this);

    // 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示物体数量（用于验证）
    this.objectText = this.add.text(10, 40, `Objects: ${this.objectCount}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示平均速度（用于验证）
    this.speedText = this.add.text(10, 70, 'Avg Speed: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  onCollision(ball1, ball2) {
    // 碰撞回调，增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 计算平均速度（用于验证物体保持 360 速度）
    let totalSpeed = 0;
    const balls = this.cyanGroup.getChildren();
    
    balls.forEach(ball => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + 
        ball.body.velocity.y ** 2
      );
      totalSpeed += speed;
    });

    const avgSpeed = totalSpeed / balls.length;
    this.speedText.setText(`Avg Speed: ${avgSpeed.toFixed(1)}`);
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