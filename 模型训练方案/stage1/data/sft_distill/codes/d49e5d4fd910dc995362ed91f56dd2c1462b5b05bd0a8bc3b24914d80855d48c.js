class BallScene extends Phaser.Scene {
  constructor() {
    super('BallScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成灰色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: 9, // 创建10个小球（0-9）
      bounceX: 1, // 完全弹性碰撞
      bounceY: 1,
      collideWorldBounds: true // 与世界边界碰撞
    });

    // 设置每个小球的初始位置和速度
    const speed = 360;
    this.balls.children.entries.forEach((ball, index) => {
      // 随机位置（避免重叠，使用网格布局）
      const row = Math.floor(index / 5);
      const col = index % 5;
      const x = 100 + col * 150;
      const y = 100 + row * 200;
      ball.setPosition(x, y);

      // 随机方向的360速度
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      ball.setVelocity(vx, vy);

      // 设置圆形碰撞体
      ball.setCircle(16);
    });

    // 小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleCollision, null, this);

    // 显示碰撞计数（用于验证状态）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示说明文字
    this.add.text(10, 40, 'Speed: 360 | Balls: 10', {
      fontSize: '16px',
      fill: '#cccccc'
    });

    // 绘制边界参考线
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 0.3);
    border.strokeRect(0, 0, this.scale.width, this.scale.height);
  }

  handleCollision(ball1, ball2) {
    // 碰撞回调，更新状态信号
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保速度保持在360左右（物理引擎可能会有微小误差）
    this.balls.children.entries.forEach(ball => {
      const velocity = ball.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差超过5%，进行修正
      if (Math.abs(currentSpeed - 360) > 18) {
        const scale = 360 / currentSpeed;
        ball.setVelocity(velocity.x * scale, velocity.y * scale);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
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