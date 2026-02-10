class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成紫色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillCircle(16, 16, 16); // 半径 16 的圆
    graphics.generateTexture('purpleCircle', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.objects = this.physics.add.group({
      key: 'purpleCircle',
      repeat: 9, // 总共 10 个物体（0-9）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个物体的随机位置和速度
    this.objects.children.iterate((obj) => {
      // 随机位置
      obj.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );

      // 随机方向的速度，速度大小为 200
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 200;
      const velocityY = Math.sin(angle) * 200;
      obj.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      obj.setCircle(16);
    });

    // 设置物体间的碰撞
    this.physics.add.collider(this.objects, this.objects, this.handleCollision, null, this);

    // 添加文本显示碰撞次数
    this.collisionText = this.add.text(10, 10, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  handleCollision(obj1, obj2) {
    // 碰撞回调，增加碰撞计数
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新碰撞计数显示
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 确保物体速度保持在 200
    this.objects.children.iterate((obj) => {
      const body = obj.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏离 200，进行修正
      if (Math.abs(currentSpeed - 200) > 1) {
        const scale = 200 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
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