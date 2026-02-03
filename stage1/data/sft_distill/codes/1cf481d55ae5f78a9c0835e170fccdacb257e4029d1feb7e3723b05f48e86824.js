class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeObjects = 0; // 可验证的状态信号
    this.collisionCount = 0; // 碰撞计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 使用 Graphics 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('greenBall', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.greenObjects = this.physics.add.group({
      key: 'greenBall',
      repeat: 19, // 创建20个物体（0-19）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个物体的随机位置和速度
    this.greenObjects.children.iterate((obj) => {
      // 随机位置
      obj.setPosition(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height - 50)
      );

      // 随机方向，固定速度80
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * 80;
      const velocityY = Math.sin(angle * Math.PI / 180) * 80;
      
      obj.setVelocity(velocityX, velocityY);
      obj.setBounce(1); // 完全弹性碰撞
    });

    // 设置物体间的碰撞
    this.physics.add.collider(
      this.greenObjects,
      this.greenObjects,
      this.handleCollision,
      null,
      this
    );

    // 初始化状态
    this.activeObjects = this.greenObjects.getLength();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatus();
  }

  handleCollision(obj1, obj2) {
    // 碰撞计数
    this.collisionCount++;
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 80 px/s`
    ]);
  }

  update(time, delta) {
    // 验证物体速度保持在80左右（考虑浮点误差）
    this.greenObjects.children.iterate((obj) => {
      const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
      
      // 如果速度偏差较大，重新归一化到80
      if (Math.abs(speed - 80) > 1) {
        const normalizedVelocity = obj.body.velocity.normalize().scale(80);
        obj.setVelocity(normalizedVelocity.x, normalizedVelocity.y);
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