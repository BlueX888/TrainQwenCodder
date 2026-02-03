class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeObjects = 0; // 可验证状态：活跃物体数量
    this.totalCollisions = 0; // 可验证状态：总碰撞次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.yellowGroup = this.physics.add.group({
      defaultKey: 'yellowBall',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建20个黄色物体
    for (let i = 0; i < 20; i++) {
      // 随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.yellowGroup.create(x, y, 'yellowBall');
      
      // 设置随机方向的速度，总速度为120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 120;
      const velocityY = Math.sin(angle) * 120;
      
      ball.setVelocity(velocityX, velocityY);
      ball.setBounce(1, 1);
      ball.setCollideWorldBounds(true);
      
      this.activeObjects++;
    }

    // 设置物体之间的碰撞
    this.physics.add.collider(
      this.yellowGroup, 
      this.yellowGroup,
      this.handleCollision,
      null,
      this
    );

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加调试信息（可选）
    console.log('Game initialized with', this.activeObjects, 'yellow objects');
  }

  handleCollision(obj1, obj2) {
    // 碰撞回调，增加碰撞计数
    this.totalCollisions++;
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Total Collisions: ${this.totalCollisions}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 确保所有物体保持恒定速度120
    this.yellowGroup.children.entries.forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏离120，进行修正
      if (Math.abs(currentSpeed - 120) > 1) {
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