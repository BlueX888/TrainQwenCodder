class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 使用 Graphics 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('orangeCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建物理组
    this.orangeGroup = this.physics.add.group({
      key: 'orangeCircle',
      repeat: 9, // 创建 10 个物体（0-9）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 为每个物体设置随机位置和随机速度
    this.orangeGroup.children.iterate((child, index) => {
      // 随机位置（避免太靠边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      child.setPosition(x, y);

      // 随机速度方向，速度大小为 200
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 200;
      const velocityY = Math.sin(angle) * 200;
      child.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体（更精确的碰撞检测）
      child.setCircle(20);
    });

    // 设置物体间的碰撞检测
    this.physics.add.collider(
      this.orangeGroup,
      this.orangeGroup,
      this.handleCollision,
      null,
      this
    );

    // 显示碰撞计数（用于验证）
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示物体数量（用于验证）
    this.countText = this.add.text(10, 40, 'Objects: 10', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  handleCollision(obj1, obj2) {
    // 碰撞时增加计数器
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    // 确保所有物体保持速度为 200
    this.orangeGroup.children.iterate((child) => {
      const currentSpeed = Math.sqrt(
        child.body.velocity.x ** 2 + child.body.velocity.y ** 2
      );
      
      // 如果速度偏离 200，重新归一化
      if (Math.abs(currentSpeed - 200) > 1) {
        const normalizedX = (child.body.velocity.x / currentSpeed) * 200;
        const normalizedY = (child.body.velocity.y / currentSpeed) * 200;
        child.setVelocity(normalizedX, normalizedY);
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);