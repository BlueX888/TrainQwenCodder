class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞次数
    this.activeObjects = 8; // 状态信号：活跃物体数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建灰色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('grayCircle', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.objectsGroup = this.physics.add.group({
      key: 'grayCircle',
      repeat: 7, // 创建8个物体（0-7）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个物体的随机位置和速度
    const objects = this.objectsGroup.getChildren();
    objects.forEach((obj) => {
      // 随机位置（避免边界）
      obj.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );

      // 设置圆形碰撞体
      obj.body.setCircle(20);

      // 随机方向，固定速度120
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 120;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      obj.setVelocity(velocityX, velocityY);
    });

    // 启用物体间碰撞
    this.physics.add.collider(
      this.objectsGroup,
      this.objectsGroup,
      this.onCollision,
      null,
      this
    );

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 监听世界边界碰撞
    this.physics.world.on('worldbounds', () => {
      this.collisionCount++;
      this.updateStatusText();
    });
  }

  onCollision(obj1, obj2) {
    // 物体间碰撞计数
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Total Collisions: ${this.collisionCount}`,
      `Speed: 120 px/s`
    ]);
  }

  update(time, delta) {
    // 验证速度保持在120左右（由于碰撞可能有微小变化）
    const objects = this.objectsGroup.getChildren();
    objects.forEach((obj) => {
      const velocity = obj.body.velocity;
      const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      // 如果速度偏差过大，重新归一化到120
      if (Math.abs(currentSpeed - 120) > 5) {
        const scale = 120 / currentSpeed;
        obj.setVelocity(velocity.x * scale, velocity.y * scale);
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