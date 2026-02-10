class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 状态信号：碰撞次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 使用 Graphics 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: 4, // 创建5个小球（0-4）
      setXY: {
        x: Phaser.Math.Between(100, 700),
        y: Phaser.Math.Between(100, 500),
        stepX: 0,
        stepY: 0
      }
    });

    // 为每个小球设置属性
    this.balls.children.iterate((ball) => {
      // 设置随机速度方向，速度大小为200
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 200;
      const velocityY = Math.sin(angle) * 200;
      
      ball.setVelocity(velocityX, velocityY);
      
      // 设置边界碰撞反弹
      ball.setCollideWorldBounds(true);
      
      // 设置弹性系数为1（完全弹性碰撞）
      ball.setBounce(1);
      
      // 设置圆形碰撞体
      ball.setCircle(16);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, null, this);

    // 显示碰撞次数文本
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示说明文本
    this.add.text(10, 40, 'Cyan balls bouncing at 200 speed', {
      fontSize: '16px',
      fill: '#00ffff'
    });

    // 添加边界可视化
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, 800, 600);
  }

  handleBallCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保小球速度保持在200左右（由于浮点误差可能会有微小变化）
    this.balls.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过1%，重新归一化到200
      if (Math.abs(currentSpeed - 200) > 2) {
        const scale = 200 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BallCollisionScene
};

new Phaser.Game(config);