class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 碰撞计数器作为验证信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用Graphics创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('ball', 20, 20);
    graphics.destroy();

    // 创建物理组来管理所有小球
    this.ballGroup = this.physics.add.group({
      key: 'ball',
      repeat: 19, // 创建20个小球
      setXY: {
        x: 100,
        y: 100,
        stepX: 70,
        stepY: 50
      }
    });

    // 配置每个小球的物理属性
    this.ballGroup.children.iterate((ball) => {
      // 设置随机速度，总速度为160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 160;
      ball.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // 设置弹性系数为1（完全弹性碰撞）
      ball.setBounce(1, 1);

      // 启用与世界边界的碰撞
      ball.setCollideWorldBounds(true);

      // 设置圆形碰撞体
      ball.body.setCircle(10);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.ballGroup, this.ballGroup, this.onBallCollision, null, this);

    // 显示碰撞计数器（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setScrollFactor(0);
    this.collisionText.setDepth(1000);

    // 显示小球数量（用于验证）
    this.ballCountText = this.add.text(10, 40, 'Balls: 20', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.ballCountText.setScrollFactor(0);
    this.ballCountText.setDepth(1000);

    // 添加边界可视化（可选）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 1);
    bounds.strokeRect(0, 0, this.physics.world.bounds.width, this.physics.world.bounds.height);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调函数，用于统计碰撞次数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保所有小球速度保持在160左右（补偿浮点误差）
    this.ballGroup.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过5%，进行修正
      if (Math.abs(currentSpeed - 160) > 8) {
        const scale = 160 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

// Phaser游戏配置
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

// 创建游戏实例
new Phaser.Game(config);