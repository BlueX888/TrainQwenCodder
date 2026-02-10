class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCount = 8;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 1. 生成紫色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('purpleBall', 32, 32);
    graphics.destroy();

    // 2. 创建球体数组
    this.balls = this.physics.add.group();

    // 3. 创建8个紫色小球
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免靠近边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const ball = this.physics.add.sprite(x, y, 'purpleBall');
      
      // 设置弹性系数为1（完全弹性碰撞）
      ball.setBounce(1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度方向，速度大小为200
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * 200;
      const vy = Math.sin(angle) * 200;
      ball.setVelocity(vx, vy);
      
      // 添加到组
      this.balls.add(ball);
    }

    // 4. 设置球与球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 5. 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 6. 显示球的数量和速度信息
    this.infoText = this.add.text(10, 40, `Balls: ${this.ballCount} | Speed: 200`, {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 7. 添加边界可视化
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 验证球的速度保持在200左右（考虑浮点误差）
    this.balls.children.entries.forEach(ball => {
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      
      // 如果速度偏离200太多，重新归一化（防止精度损失）
      if (Math.abs(speed - 200) > 1) {
        const scale = 200 / speed;
        ball.body.velocity.x *= scale;
        ball.body.velocity.y *= scale;
      }
    });
  }

  onBallCollision(ball1, ball2) {
    // 碰撞计数器递增
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
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
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);