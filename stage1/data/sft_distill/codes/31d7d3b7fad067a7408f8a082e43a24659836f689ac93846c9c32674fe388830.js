class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 碰撞计数器（可验证状态）
    this.ballCount = 3; // 小球数量（可验证状态）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueBall', 32, 32);
    graphics.destroy();

    // 创建小球组
    this.balls = this.physics.add.group();

    // 创建3个小球
    for (let i = 0; i < this.ballCount; i++) {
      const x = Phaser.Math.Between(100, width - 100);
      const y = Phaser.Math.Between(100, height - 100);
      
      const ball = this.physics.add.sprite(x, y, 'blueBall');
      
      // 设置完全弹性碰撞
      ball.setBounce(1, 1);
      
      // 设置与世界边界碰撞
      ball.setCollideWorldBounds(true);
      
      // 设置随机方向的速度，速度大小为80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      ball.setVelocity(velocityX, velocityY);
      
      // 添加到组
      this.balls.add(ball);
    }

    // 设置小球之间的碰撞
    this.physics.add.collider(this.balls, this.balls, this.onBallCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界提示
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xffffff, 0.5);
    borderGraphics.strokeRect(0, 0, width, height);
  }

  onBallCollision(ball1, ball2) {
    // 碰撞计数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    let statusInfo = `Ball Count: ${this.ballCount}\n`;
    statusInfo += `Collisions: ${this.collisionCount}\n`;
    
    // 显示每个小球的速度（验证速度保持在80左右）
    this.balls.children.entries.forEach((ball, index) => {
      const speed = Math.sqrt(
        ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
      ).toFixed(1);
      statusInfo += `Ball ${index + 1} Speed: ${speed}\n`;
    });
    
    this.statusText.setText(statusInfo);
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
  scene: GameScene
};

new Phaser.Game(config);