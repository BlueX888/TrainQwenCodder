class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCollisions = 0; // 小球间碰撞次数
    this.wallCollisions = 0; // 墙壁碰撞次数
  }

  preload() {
    // 程序化生成蓝色小球纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x3498db, 1); // 蓝色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 配置物理世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建3个小球数组
    this.balls = [];
    const ballSpeed = 120;
    const ballRadius = 16;

    // 创建3个小球，设置不同的初始位置和速度方向
    const positions = [
      { x: 200, y: 200, vx: 1, vy: 1 },
      { x: 600, y: 200, vx: -1, vy: 1 },
      { x: 400, y: 400, vx: 0, vy: -1 }
    ];

    positions.forEach((pos, index) => {
      // 创建物理精灵
      const ball = this.physics.add.sprite(pos.x, pos.y, 'blueBall');
      
      // 设置圆形碰撞体（更精确的碰撞检测）
      ball.setCircle(ballRadius);
      
      // 设置完全弹性碰撞（反弹系数为1）
      ball.setBounce(1, 1);
      
      // 启用与世界边界的碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置初始速度（120速度，不同方向）
      const angle = Phaser.Math.DegToRad(index * 120); // 每个球不同角度
      const vx = Math.cos(angle) * ballSpeed;
      const vy = Math.sin(angle) * ballSpeed;
      ball.setVelocity(vx, vy);
      
      // 防止速度衰减
      ball.body.setDamping(false);
      ball.body.useDamping = false;
      
      this.balls.push(ball);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls[0], this.balls[1], this.onBallCollision, null, this);
    this.physics.add.collider(this.balls[0], this.balls[2], this.onBallCollision, null, this);
    this.physics.add.collider(this.balls[1], this.balls[2], this.onBallCollision, null, this);

    // 监听世界边界碰撞
    this.balls.forEach(ball => {
      ball.body.onWorldBounds = true;
    });
    
    this.physics.world.on('worldbounds', () => {
      this.wallCollisions++;
      this.collisionCount++;
    });

    // 创建信息显示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建边界可视化（可选，便于调试）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, this.scale.width, this.scale.height);
  }

  onBallCollision(ball1, ball2) {
    // 小球碰撞回调
    this.ballCollisions++;
    this.collisionCount++;
    
    // 确保速度保持在120左右（避免累积误差）
    const speed = 120;
    const v1 = ball1.body.velocity;
    const v2 = ball2.body.velocity;
    
    const magnitude1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const magnitude2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    
    if (magnitude1 > 0) {
      ball1.setVelocity(
        (v1.x / magnitude1) * speed,
        (v1.y / magnitude1) * speed
      );
    }
    
    if (magnitude2 > 0) {
      ball2.setVelocity(
        (v2.x / magnitude2) * speed,
        (v2.y / magnitude2) * speed
      );
    }
  }

  update(time, delta) {
    // 更新信息显示
    this.infoText.setText([
      `Total Collisions: ${this.collisionCount}`,
      `Ball Collisions: ${this.ballCollisions}`,
      `Wall Collisions: ${this.wallCollisions}`,
      `Ball Speeds: ${this.balls.map(b => {
        const v = b.body.velocity;
        return Math.round(Math.sqrt(v.x * v.x + v.y * v.y));
      }).join(', ')}`
    ]);

    // 确保小球速度保持恒定（防止物理引擎误差累积）
    this.balls.forEach(ball => {
      const velocity = ball.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏离120太多，进行修正
      if (Math.abs(speed - 120) > 5) {
        const scale = 120 / speed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false // 设置为true可查看碰撞体
    }
  },
  scene: BallCollisionScene
};

// 启动游戏
new Phaser.Game(config);