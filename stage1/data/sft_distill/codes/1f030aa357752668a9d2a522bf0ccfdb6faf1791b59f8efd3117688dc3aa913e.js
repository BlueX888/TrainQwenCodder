class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证状态：碰撞计数
    this.ballCount = 8; // 小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建紫色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9933ff, 1); // 紫色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('purpleBall', 32, 32);
    graphics.destroy();

    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.ballGroup = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 添加8个小球
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.ballGroup.create(x, y, 'purpleBall');
      
      // 设置随机速度方向，速度大小为200
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 200;
      const velocityY = Math.sin(angle) * 200;
      
      ball.setVelocity(velocityX, velocityY);
      ball.setBounce(1); // 完全弹性碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体
      ball.body.setCircle(16);
    }

    // 设置小球之间的碰撞
    this.physics.add.collider(this.ballGroup, this.ballGroup, this.handleBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示边界（可选，用于调试）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, 800, 600);

    console.log('游戏开始：8个紫色小球已创建');
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `小球数量: ${this.ballCount}`,
      `碰撞次数: ${this.collisionCount}`,
      `运行时间: ${Math.floor(time / 1000)}s`
    ]);

    // 确保所有小球保持速度为200（修正浮点误差）
    this.ballGroup.children.entries.forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过5%，重新归一化
      if (Math.abs(currentSpeed - 200) > 10) {
        const scale = 200 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
      }
    });
  }

  handleBallCollision(ball1, ball2) {
    // 记录碰撞
    this.collisionCount++;
    
    // 碰撞后确保速度保持在200
    [ball1, ball2].forEach(ball => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      if (speed > 0) {
        const scale = 200 / speed;
        ball.body.setVelocity(ball.body.velocity.x * scale, ball.body.velocity.y * scale);
      }
    });
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