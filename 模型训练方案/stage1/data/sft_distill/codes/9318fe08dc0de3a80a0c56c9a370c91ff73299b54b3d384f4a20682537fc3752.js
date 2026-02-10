class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理精灵组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: 4, // 创建5个小球（1个默认 + 4个重复）
      setXY: { 
        x: 100, 
        y: 100, 
        stepX: 150 // 横向间隔分布
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball, index) => {
      // 设置随机速度（200左右的速度）
      const angle = Phaser.Math.Between(0, 360);
      const speed = 200;
      this.physics.velocityFromAngle(angle, speed, ball.body.velocity);

      // 设置碰撞属性
      ball.setCollideWorldBounds(true); // 与世界边界碰撞
      ball.setBounce(1); // 完全弹性碰撞（bounce=1）
      ball.body.setCircle(16); // 设置圆形碰撞体
      
      // 设置阻力为0，保持恒定速度
      ball.body.setDamping(false);
      ball.body.setDrag(0);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, null, this);

    // 显示碰撞计数
    this.collisionText = this.add.text(16, 16, 'Collisions: 0', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明
    this.add.text(16, 560, '5个青色小球在封闭空间内弹性碰撞', {
      fontSize: '18px',
      color: '#00ffff'
    });
  }

  handleBallCollision(ball1, ball2) {
    // 碰撞回调：增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保小球速度保持在200左右
    this.balls.children.iterate((ball) => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏离200太多，进行修正
      if (Math.abs(currentSpeed - 200) > 10) {
        const scale = 200 / currentSpeed;
        ball.body.velocity.x *= scale;
        ball.body.velocity.y *= scale;
      }
    });
  }
}

// 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);