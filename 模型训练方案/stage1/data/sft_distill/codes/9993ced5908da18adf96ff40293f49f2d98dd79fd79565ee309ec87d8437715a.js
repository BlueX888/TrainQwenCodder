class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeObjects = 0; // 状态信号：活跃物体数量
    this.totalCollisions = 0; // 状态信号：总碰撞次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillCircle(20, 20, 20); // 半径为 20 的圆
    graphics.generateTexture('cyanBall', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.objectGroup = this.physics.add.group({
      key: 'cyanBall',
      repeat: 14, // 创建 15 个物体（1 + 14）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个物体的随机位置和速度
    const objects = this.objectGroup.getChildren();
    this.activeObjects = objects.length;

    objects.forEach((obj, index) => {
      // 随机位置（避免重叠）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      obj.setPosition(x, y);

      // 随机方向，速度为 200
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * 200;
      const velocityY = Math.sin(angle * Math.PI / 180) * 200;
      obj.setVelocity(velocityX, velocityY);

      // 设置反弹
      obj.setBounce(1, 1);
      obj.setCollideWorldBounds(true);
    });

    // 设置物体之间的碰撞
    this.physics.add.collider(this.objectGroup, this.objectGroup, this.onCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  onCollision(obj1, obj2) {
    // 碰撞回调
    this.totalCollisions++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText(
      `Active Objects: ${this.activeObjects}\n` +
      `Total Collisions: ${this.totalCollisions}\n` +
      `Speed: 200 px/s`
    );
  }

  update(time, delta) {
    // 验证速度保持在 200 左右（由于碰撞可能有轻微偏差）
    const objects = this.objectGroup.getChildren();
    objects.forEach(obj => {
      const body = obj.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过 5%，重新归一化到 200
      if (Math.abs(currentSpeed - 200) > 10) {
        const normalizedVelX = (body.velocity.x / currentSpeed) * 200;
        const normalizedVelY = (body.velocity.y / currentSpeed) * 200;
        body.setVelocity(normalizedVelX, normalizedVelY);
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