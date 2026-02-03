class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 碰撞计数器（验证信号）
    this.activeObjects = 0; // 活跃物体数量（验证信号）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('cyanBall', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.objectGroup = this.physics.add.group({
      key: 'cyanBall',
      repeat: 9, // 创建10个物体（0-9）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个物体的随机位置和速度
    const objects = this.objectGroup.getChildren();
    this.activeObjects = objects.length;

    objects.forEach((obj, index) => {
      // 随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      obj.setPosition(x, y);

      // 随机方向，速度为80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      obj.setVelocity(velocityX, velocityY);

      // 设置反弹系数
      obj.setBounce(1, 1);
    });

    // 添加物体间的碰撞检测
    this.physics.add.collider(
      this.objectGroup,
      this.objectGroup,
      this.handleCollision,
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
  }

  handleCollision(obj1, obj2) {
    // 碰撞回调，增加计数器
    this.collisionCount++;
  }

  updateStatusText() {
    this.statusText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 80 px/s`
    ]);
  }

  update(time, delta) {
    // 更新状态显示
    this.updateStatusText();

    // 验证速度保持在80左右（考虑浮点误差）
    const objects = this.objectGroup.getChildren();
    objects.forEach(obj => {
      const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
      
      // 如果速度偏差过大，重新归一化到80
      if (Math.abs(speed - 80) > 1) {
        const normalizedVx = (obj.body.velocity.x / speed) * 80;
        const normalizedVy = (obj.body.velocity.y / speed) * 80;
        obj.setVelocity(normalizedVx, normalizedVy);
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