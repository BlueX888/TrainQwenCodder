class BallBounceScene extends Phaser.Scene {
  constructor() {
    super('BallBounceScene');
    this.collisionCount = 0;
    this.balls = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      collisionCount: 0,
      ballCount: 5,
      ballSpeed: 300,
      ballPositions: []
    };

    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();

    // 创建物理组来管理所有球
    this.balls = this.physics.add.group({
      defaultKey: 'blueBall',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建 5 个球，设置随机位置和速度
    const ballRadius = 16;
    const margin = 50;
    
    for (let i = 0; i < 5; i++) {
      // 随机位置（避免太靠近边界）
      const x = Phaser.Math.Between(margin + ballRadius, 800 - margin - ballRadius);
      const y = Phaser.Math.Between(margin + ballRadius, 600 - margin - ballRadius);
      
      const ball = this.balls.create(x, y, 'blueBall');
      
      // 设置随机速度方向，速度大小为 300
      const angle = Phaser.Math.Between(0, 360);
      const velocity = this.physics.velocityFromAngle(angle, 300);
      ball.setVelocity(velocity.x, velocity.y);
      
      // 设置完全弹性碰撞
      ball.setBounce(1, 1);
      ball.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体
      ball.body.setCircle(16);
      
      // 消除摩擦和阻力，保持恒定速度
      ball.body.setDamping(false);
      ball.body.setDrag(0);
      ball.body.setMaxVelocity(300, 300);
    }

    // 添加球与球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', (body) => {
      this.collisionCount++;
      window.__signals__.collisionCount = this.collisionCount;
      console.log(JSON.stringify({
        type: 'world_collision',
        totalCollisions: this.collisionCount,
        timestamp: Date.now()
      }));
    });

    // 启用世界边界碰撞事件
    this.physics.world.setBoundsCollision(true, true, true, true);
    this.balls.children.entries.forEach(ball => {
      ball.body.onWorldBounds = true;
    });

    // 添加调试文本显示
    this.collisionText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log(JSON.stringify({
      type: 'game_start',
      ballCount: 5,
      speed: 300,
      timestamp: Date.now()
    }));
  }

  onBallCollision(ball1, ball2) {
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;
    
    console.log(JSON.stringify({
      type: 'ball_collision',
      ball1: { x: Math.round(ball1.x), y: Math.round(ball1.y) },
      ball2: { x: Math.round(ball2.x), y: Math.round(ball2.y) },
      totalCollisions: this.collisionCount,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 更新信号数据
    const positions = [];
    this.balls.children.entries.forEach((ball, index) => {
      positions.push({
        id: index,
        x: Math.round(ball.x),
        y: Math.round(ball.y),
        vx: Math.round(ball.body.velocity.x),
        vy: Math.round(ball.body.velocity.y)
      });
      
      // 确保速度保持在 300 左右（修正浮点误差）
      const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
      if (Math.abs(speed - 300) > 1) {
        const scale = 300 / speed;
        ball.body.velocity.x *= scale;
        ball.body.velocity.y *= scale;
      }
    });
    
    window.__signals__.ballPositions = positions;

    // 更新显示文本
    this.collisionText.setText(
      `碰撞次数: ${this.collisionCount}\n` +
      `球数量: ${this.balls.children.entries.length}\n` +
      `速度: 300 px/s`
    );
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BallBounceScene
};

new Phaser.Game(config);