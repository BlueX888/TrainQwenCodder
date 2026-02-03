class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeObjectsCount = 0; // 状态信号：活跃物体数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('blueCircle', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.objectsGroup = this.physics.add.group({
      key: 'blueCircle',
      repeat: 14, // 创建15个物体（1 + 14）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个物体的随机位置和速度
    const objects = this.objectsGroup.getChildren();
    objects.forEach((obj) => {
      // 随机位置
      obj.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );

      // 随机方向，固定速度160
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 160;
      const velocityY = Math.sin(angle) * 160;
      obj.setVelocity(velocityX, velocityY);
    });

    // 设置物体之间相互碰撞
    this.physics.add.collider(this.objectsGroup, this.objectsGroup);

    // 更新状态信号
    this.activeObjectsCount = objects.length;

    // 添加调试信息显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 更新调试信息
    const objects = this.objectsGroup.getChildren();
    let totalSpeed = 0;
    
    objects.forEach((obj) => {
      const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
      totalSpeed += speed;
    });

    const avgSpeed = totalSpeed / objects.length;

    this.debugText.setText([
      `Active Objects: ${this.activeObjectsCount}`,
      `Average Speed: ${avgSpeed.toFixed(2)}`,
      `Target Speed: 160`
    ]);
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