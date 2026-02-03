class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.ballCollisionCount = 0; // 球与球碰撞次数
    this.wallCollisionCount = 0; // 球与墙碰撞次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ball', 32, 32);
    graphics.destroy();

    // 设置世界边界
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建球数组
    this.balls = [];

    // 创建3个球
    for (let i = 0; i < 3; i++) {
      // 随机位置（避免边缘）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const ball = this.physics.add.sprite(x, y, 'ball');
      
      // 设置弹性系数为1（完全弹性碰撞）
      ball.setBounce(1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机速度方向，速度大小为80
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * 80;
      const velocityY = Math.sin(angle * Math.PI / 180) * 80;
      ball.setVelocity(velocityX, velocityY);
      
      // 禁用重力影响
      ball.body.setAllowGravity(false);
      
      // 添加到数组
      this.balls.push(ball);
    }

    // 设置球与球之间的碰撞
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        this.physics.add.collider(this.balls[i], this.balls[j], () => {
          this.ballCollisionCount++;
          this.collisionCount++;
        });
      }
    }

    // 监听世界边界碰撞事件
    this.balls.forEach(ball => {
      ball.body.onWorldBounds = true;
    });

    this.physics.world.on('worldbounds', () => {
      this.wallCollisionCount++;
      this.collisionCount++;
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明文字
    this.add.text(10, 560, '绿色小球以80速度移动，碰撞边界和彼此时弹开', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `总碰撞次数: ${this.collisionCount}`,
      `球与球碰撞: ${this.ballCollisionCount}`,
      `球与墙碰撞: ${this.wallCollisionCount}`
    ]);

    // 确保速度保持在80左右（补偿浮点误差）
    this.balls.forEach(ball => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + 
        ball.body.velocity.y ** 2
      );
      
      // 如果速度偏离80太多，进行修正
      if (Math.abs(speed - 80) > 1) {
        const ratio = 80 / speed;
        ball.setVelocity(
          ball.body.velocity.x * ratio,
          ball.body.velocity.y * ratio
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