class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证的状态信号
    this.activeObjects = 10; // 活跃物体数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const SPEED = 240;
    const OBJECT_COUNT = 10;
    const OBJECT_RADIUS = 20;

    // 使用 Graphics 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillCircle(OBJECT_RADIUS, OBJECT_RADIUS, OBJECT_RADIUS);
    graphics.generateTexture('greenCircle', OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
    graphics.destroy();

    // 创建物理组
    this.greenObjects = this.physics.add.group({
      key: 'greenCircle',
      repeat: OBJECT_COUNT - 1,
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 为每个物体设置随机位置和随机方向的速度
    this.greenObjects.children.entries.forEach((obj) => {
      // 随机位置（避免边界）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      obj.setPosition(x, y);

      // 随机方向（角度），速度为 240
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const vx = Math.cos(angle) * SPEED;
      const vy = Math.sin(angle) * SPEED;
      obj.setVelocity(vx, vy);

      // 设置圆形碰撞体
      obj.setCircle(OBJECT_RADIUS);
    });

    // 添加物体间的碰撞检测
    this.physics.add.collider(
      this.greenObjects,
      this.greenObjects,
      this.handleCollision,
      null,
      this
    );

    // 显示状态信息（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  handleCollision(obj1, obj2) {
    // 碰撞计数器递增
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText(
      `Objects: ${this.activeObjects}\n` +
      `Collisions: ${this.collisionCount}\n` +
      `Speed: 240`
    );
  }

  update(time, delta) {
    // 可选：验证速度保持在 240 左右
    // this.greenObjects.children.entries.forEach((obj) => {
    //   const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
    //   console.log('Speed:', speed.toFixed(2));
    // });
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