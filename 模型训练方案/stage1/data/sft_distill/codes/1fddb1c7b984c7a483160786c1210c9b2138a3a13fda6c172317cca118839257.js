class BallCollisionScene extends Phaser.Scene {
  constructor() {
    super('BallCollisionScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCollisionCount = 0; // 球体间碰撞计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();

    // 创建物理球体组
    this.balls = this.physics.add.group();

    // 创建 3 个球体，设置随机方向但固定速度为 120
    const speed = 120;
    const positions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 400 }
    ];

    positions.forEach((pos, index) => {
      const ball = this.physics.add.sprite(pos.x, pos.y, 'blueBall');
      
      // 设置完全弹性碰撞（反弹系数为 1）
      ball.setBounce(1, 1);
      
      // 启用世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机方向的速度，但保持总速度为 120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);
      
      // 设置阻尼为 0，保持匀速运动
      ball.body.setDamping(false);
      ball.body.useDamping = false;
      
      // 添加到组
      this.balls.add(ball);
    });

    // 设置球体间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界可视化
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 1);
    bounds.strokeRect(0, 0, this.scale.width, this.scale.height);
  }

  onBallCollision(ball1, ball2) {
    // 球体间碰撞回调
    this.ballCollisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Wall Collisions: ${this.collisionCount}`,
      `Ball Collisions: ${this.ballCollisionCount}`,
      `Balls Active: ${this.balls.getChildren().length}`
    ]);

    // 确保球体速度保持在 120 左右（由于浮点误差可能会有微小变化）
    this.balls.getChildren().forEach(ball => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过 5%，进行修正
      if (Math.abs(currentSpeed - 120) > 6) {
        const scale = 120 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
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
  scene: BallCollisionScene
};

new Phaser.Game(config);