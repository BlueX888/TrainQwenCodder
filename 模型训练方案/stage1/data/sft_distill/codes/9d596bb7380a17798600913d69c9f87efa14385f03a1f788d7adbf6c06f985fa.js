class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.activeBalls = 0; // 状态信号：活跃小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建紫色小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('purpleBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.ballsGroup = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建20个小球
    const speed = 300;
    for (let i = 0; i < 20; i++) {
      // 随机位置（避免重叠，留出边距）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.ballsGroup.create(x, y, 'purpleBall');
      
      // 设置随机方向的速度，保持总速度为300
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      ball.setVelocity(vx, vy);
      ball.setBounce(1); // 完全弹性碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体
      ball.body.setCircle(16);
    }

    this.activeBalls = this.ballsGroup.getChildren().length;

    // 添加小球之间的碰撞
    this.physics.add.collider(
      this.ballsGroup, 
      this.ballsGroup, 
      this.handleBallCollision, 
      null, 
      this
    );

    // 显示状态信息
    this.collisionText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界可视化
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 1);
    bounds.strokeRect(0, 0, 800, 600);
  }

  handleBallCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新显示信息
    this.collisionText.setText([
      `Active Balls: ${this.activeBalls}`,
      `Collisions: ${this.collisionCount}`,
      `FPS: ${Math.round(this.game.loop.actualFps)}`
    ]);

    // 确保小球速度保持在300左右（考虑浮点误差）
    this.ballsGroup.getChildren().forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差过大，重新归一化到300
      if (Math.abs(currentSpeed - 300) > 10) {
        const scale = 300 / currentSpeed;
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
  scene: BallCollisionScene
};

const game = new Phaser.Game(config);