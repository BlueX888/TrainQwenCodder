class BallScene extends Phaser.Scene {
  constructor() {
    super('BallScene');
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 使用 Graphics 创建蓝色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'blueBall',
      repeat: 9, // 创建 10 个小球（0-9）
      setXY: {
        x: 100,
        y: 100,
        stepX: 70
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball) => {
      // 设置边界碰撞反弹
      ball.setCollideWorldBounds(true);
      
      // 设置完全弹性碰撞（反弹系数为1）
      ball.setBounce(1, 1);
      
      // 设置随机速度，最大速度为 200
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 200;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);
      
      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.body.setCircle(16);
    });

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数（调试信息）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示说明文字
    this.add.text(10, 40, '10 blue balls bouncing with elastic collision', {
      fontSize: '16px',
      fill: '#cccccc'
    });

    // 绘制边界提示
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.5);
    graphics.strokeRect(0, 0, this.scale.width, this.scale.height);
  }

  onBallCollision(ball1, ball2) {
    // 记录碰撞次数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保所有小球的速度保持在 200 左右（考虑浮点误差）
    this.balls.children.iterate((ball) => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏离 200 太多，进行修正（允许 ±5 的误差）
      if (Math.abs(currentSpeed - 200) > 5) {
        const scale = 200 / currentSpeed;
        body.velocity.x *= scale;
        body.velocity.y *= scale;
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
  scene: BallScene
};

new Phaser.Game(config);