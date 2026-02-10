class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 可验证状态：碰撞次数
    this.activeObjects = 8; // 可验证状态：活动物体数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('blueCircle', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.objects = this.physics.add.group({
      defaultKey: 'blueCircle',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建8个物体并设置随机速度
    for (let i = 0; i < 8; i++) {
      // 随机位置（避免边缘）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const obj = this.objects.create(x, y, 'blueCircle');
      
      // 设置随机方向的速度，速度大小为300
      const angle = Phaser.Math.Between(0, 360);
      const velocity = this.physics.velocityFromAngle(angle, 300);
      obj.setVelocity(velocity.x, velocity.y);
      
      // 设置圆形碰撞体
      obj.setCircle(20);
      obj.setBounce(1);
    }

    // 设置物体间的碰撞检测
    this.physics.add.collider(this.objects, this.objects, this.onCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  onCollision(obj1, obj2) {
    // 碰撞回调，增加计数器
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Collisions: ${this.collisionCount}`,
      `Speed: 300 px/s`
    ]);
  }

  update(time, delta) {
    // 确保速度保持在300
    this.objects.children.entries.forEach(obj => {
      const body = obj.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差过大，重新标准化到300
      if (Math.abs(currentSpeed - 300) > 1) {
        const scale = 300 / currentSpeed;
        body.setVelocity(body.velocity.x * scale, body.velocity.y * scale);
      }
    });
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);