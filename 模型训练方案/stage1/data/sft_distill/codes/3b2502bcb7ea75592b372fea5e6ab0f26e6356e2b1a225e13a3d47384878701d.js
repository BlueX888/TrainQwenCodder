class BallScene extends Phaser.Scene {
  constructor() {
    super('BallScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();

    // 创建物理球体组
    this.balls = this.physics.add.group();

    // 创建 3 个蓝色小球
    const speed = 80;
    const positions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 400 }
    ];

    positions.forEach((pos, index) => {
      const ball = this.physics.add.sprite(pos.x, pos.y, 'blueBall');
      
      // 设置完全弹性碰撞
      ball.setBounce(1, 1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机方向的初始速度（速度大小为 80）
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);
      
      // 添加到组
      this.balls.add(ball);
      
      // 为每个球添加名称标识
      ball.name = `ball${index + 1}`;
    });

    // 设置球体之间的碰撞
    this.physics.add.collider(
      this.balls,
      this.balls,
      this.handleBallCollision,
      null,
      this
    );

    // 显示碰撞计数
    this.collisionText = this.add.text(16, 16, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明文字
    this.add.text(16, 50, 'Blue balls bouncing with elastic collision', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界提示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, this.scale.width, this.scale.height);
  }

  handleBallCollision(ball1, ball2) {
    // 增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
    
    // 碰撞时产生轻微的视觉反馈（可选）
    ball1.setTint(0xffffff);
    ball2.setTint(0xffffff);
    
    this.time.delayedCall(100, () => {
      ball1.clearTint();
      ball2.clearTint();
    });
  }

  update(time, delta) {
    // 确保球体速度保持在 80 左右（处理浮点误差）
    this.balls.children.entries.forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过 5%，重新归一化
      if (Math.abs(currentSpeed - 80) > 4) {
        const scale = 80 / currentSpeed;
        body.setVelocity(
          body.velocity.x * scale,
          body.velocity.y * scale
        );
      }
    });
  }
}

// 游戏配置
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
  scene: BallScene
};

// 创建游戏实例
const game = new Phaser.Game(config);