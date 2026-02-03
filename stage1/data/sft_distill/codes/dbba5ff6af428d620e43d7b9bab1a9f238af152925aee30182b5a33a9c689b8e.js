class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号：碰撞计数
    this.ballCount = 3; // 小球数量
    this.ballSpeed = 80; // 小球速度
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

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建物理组
    this.balls = this.physics.add.group({
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 创建3个小球
    for (let i = 0; i < this.ballCount; i++) {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const ball = this.balls.create(x, y, 'ball');
      
      // 设置随机速度方向，但保持速度大小为80
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * this.ballSpeed;
      const velocityY = Math.sin(angle * Math.PI / 180) * this.ballSpeed;
      
      ball.setVelocity(velocityX, velocityY);
      
      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.setCircle(16);
    }

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 添加文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加边界显示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 1);
    bounds.strokeRect(0, 0, 800, 600);

    // 添加说明文本
    this.add.text(10, 560, 'Cyan balls bouncing with elastic collision', {
      fontSize: '16px',
      fill: '#00ffff'
    });
  }

  onBallCollision(ball1, ball2) {
    // 碰撞回调：增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保速度保持恒定（可选，防止浮点误差累积）
    this.balls.children.entries.forEach(ball => {
      const currentSpeed = Math.sqrt(
        ball.body.velocity.x ** 2 + 
        ball.body.velocity.y ** 2
      );
      
      // 如果速度偏差超过1，重新归一化
      if (Math.abs(currentSpeed - this.ballSpeed) > 1) {
        const scale = this.ballSpeed / currentSpeed;
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
  backgroundColor: '#000000',
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
const game = new Phaser.Game(config);