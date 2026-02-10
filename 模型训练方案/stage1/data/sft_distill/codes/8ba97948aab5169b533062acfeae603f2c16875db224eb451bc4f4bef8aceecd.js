class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('pinkCircle', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.pinkGroup = this.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建5个粉色物体
    for (let i = 0; i < 5; i++) {
      // 随机位置（避免边缘）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const pinkObj = this.pinkGroup.create(x, y, 'pinkCircle');
      
      // 设置随机方向的速度，速率为80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      
      pinkObj.setVelocity(velocityX, velocityY);
      pinkObj.setCircle(20); // 设置碰撞体为圆形
    }

    // 设置物体间的碰撞
    this.physics.add.collider(
      this.pinkGroup,
      this.pinkGroup,
      this.handleCollision,
      null,
      this
    );

    // 添加调试文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加速度信息文本
    this.infoText = this.add.text(10, 40, 'Speed: 80 px/s', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  handleCollision(obj1, obj2) {
    // 碰撞时增加计数器
    this.collisionCount++;
    this.collisionText.setText('Collisions: ' + this.collisionCount);
  }

  update(time, delta) {
    // 确保所有物体保持恒定速度80
    this.pinkGroup.children.entries.forEach(obj => {
      const currentSpeed = Math.sqrt(
        obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2
      );
      
      // 如果速度偏离80，重新归一化
      if (Math.abs(currentSpeed - 80) > 1) {
        const angle = Math.atan2(obj.body.velocity.y, obj.body.velocity.x);
        obj.setVelocity(Math.cos(angle) * 80, Math.sin(angle) * 80);
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

const game = new Phaser.Game(config);