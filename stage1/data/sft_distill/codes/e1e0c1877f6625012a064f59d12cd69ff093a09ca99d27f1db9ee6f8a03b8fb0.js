class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.balls = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建灰色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      collideWorldBounds: true,
      bounceX: 1,
      bounceY: 1
    });

    // 创建 8 个小球
    const ballCount = 8;
    const speed = 360;
    
    for (let i = 0; i < ballCount; i++) {
      // 随机位置（避免太靠近边缘）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 创建小球
      const ball = this.balls.create(x, y, 'ball');
      
      // 设置完全弹性
      ball.setBounce(1, 1);
      
      // 随机速度方向（保持速度大小为360）
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);
      
      // 设置圆形碰撞体（更精确）
      ball.body.setCircle(16);
    }

    // 添加小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示碰撞计数器
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明文字
    this.add.text(10, 50, 'Gray balls bouncing with elastic collision', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界可视化
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, 800, 600);
  }

  onBallCollision(ball1, ball2) {
    // 增加碰撞计数
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保速度保持恒定（补偿浮点误差）
    this.balls.children.entries.forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏离360太多，进行修正
      if (Math.abs(currentSpeed - 360) > 5) {
        const scale = 360 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
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
  scene: BallBounceScene
};

// 创建游戏实例
new Phaser.Game(config);