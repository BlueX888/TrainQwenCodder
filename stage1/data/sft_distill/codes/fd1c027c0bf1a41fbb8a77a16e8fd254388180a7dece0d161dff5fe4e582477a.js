class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeObjectsCount = 0; // 状态信号：活跃物体数量
    this.collisionCount = 0; // 状态信号：碰撞次数
  }

  preload() {
    // 使用 Graphics 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFF00, 1); // 黄色
    graphics.fillCircle(16, 16, 16); // 半径16的圆形
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理组
    this.ballGroup = this.physics.add.group({
      key: 'yellowBall',
      repeat: 19, // 创建20个物体（1个默认 + 19个重复）
      setXY: {
        x: Phaser.Math.Between(50, 750),
        y: Phaser.Math.Between(50, 550),
        stepX: 0,
        stepY: 0
      }
    });

    // 为每个物体设置属性
    this.ballGroup.children.iterate((ball) => {
      // 设置随机速度方向，速度大小为120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 120;
      const velocityY = Math.sin(angle) * 120;
      
      ball.setVelocity(velocityX, velocityY);
      
      // 设置反弹系数为1（完全弹性碰撞）
      ball.setBounce(1, 1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体，更准确的碰撞检测
      ball.body.setCircle(16);
    });

    // 设置物体间的碰撞
    this.physics.add.collider(this.ballGroup, this.ballGroup, this.onCollision, null, this);

    // 更新活跃物体数量
    this.activeObjectsCount = this.ballGroup.getLength();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  onCollision(ball1, ball2) {
    // 碰撞回调，增加碰撞计数
    this.collisionCount++;
  }

  updateStatusText() {
    this.statusText.setText([
      `Active Objects: ${this.activeObjectsCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 120 px/s`
    ]);
  }

  update(time, delta) {
    // 每帧更新状态显示
    this.updateStatusText();

    // 验证速度保持在120左右（考虑浮点误差）
    this.ballGroup.children.iterate((ball) => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + 
        ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差过大，重新归一化到120
      if (Math.abs(speed - 120) > 1) {
        const scale = 120 / speed;
        ball.setVelocity(
          ball.body.velocity.x * scale,
          ball.body.velocity.y * scale
        );
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