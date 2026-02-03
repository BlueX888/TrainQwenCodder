class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证状态：碰撞次数
    this.ballCount = 3; // 可验证状态：小球数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 设置世界边界
    this.physics.world.setBounds(0, 0, width, height);

    // 使用 Graphics 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.balls = this.physics.add.group({
      key: 'ball',
      repeat: 2, // 创建3个小球（0 + repeat 2）
      setXY: {
        x: 100,
        y: 100,
        stepX: 200 // 水平间隔
      }
    });

    // 配置每个小球
    this.balls.children.iterate((ball, index) => {
      // 设置碰撞边界反弹
      ball.setCollideWorldBounds(true);
      
      // 设置弹性系数（完全弹性碰撞）
      ball.setBounce(1, 1);
      
      // 设置随机初始速度，总速度约为80
      const angle = Phaser.Math.Between(0, 360);
      const velocity = this.physics.velocityFromAngle(angle, 80);
      ball.setVelocity(velocity.x, velocity.y);
      
      // 防止小球旋转
      ball.setAngularVelocity(0);
      
      // 设置阻尼为0，保持速度恒定
      ball.setDamping(false);
      ball.setDrag(0);
    });

    // 添加小球之间的碰撞检测
    this.physics.add.collider(this.balls, this.balls, this.handleCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  handleCollision(ball1, ball2) {
    // 碰撞回调函数
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Balls: ${this.ballCount}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 80`
    ]);
  }

  update(time, delta) {
    // 保持小球速度恒定在80左右
    this.balls.children.iterate((ball) => {
      const body = ball.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏离80太多，重新规范化
      if (Math.abs(currentSpeed - 80) > 1) {
        const angle = Math.atan2(body.velocity.y, body.velocity.x);
        body.setVelocity(
          Math.cos(angle) * 80,
          Math.sin(angle) * 80
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