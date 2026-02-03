class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.activeObjects = 20; // 状态信号：活跃物体数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('greenCircle', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.objectsGroup = this.physics.add.group({
      defaultKey: 'greenCircle',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建20个物体
    for (let i = 0; i < 20; i++) {
      // 随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const obj = this.objectsGroup.create(x, y, 'greenCircle');
      
      // 设置随机方向，但保持速度为360
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = 360;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      obj.setVelocity(velocityX, velocityY);
      obj.setBounce(1, 1);
      obj.setCollideWorldBounds(true);
      
      // 设置圆形碰撞体
      obj.body.setCircle(16);
    }

    // 设置物体间碰撞
    this.physics.add.collider(
      this.objectsGroup,
      this.objectsGroup,
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
    // 碰撞计数器递增
    this.collisionCount++;
  }

  updateStatusText() {
    this.statusText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Total Collisions: ${this.collisionCount}`,
      `Speed: 360 px/s`
    ]);
  }

  update(time, delta) {
    // 更新状态显示
    this.updateStatusText();

    // 确保每个物体保持恒定速度360
    this.objectsGroup.getChildren().forEach(obj => {
      const body = obj.body;
      const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      
      // 如果速度偏差超过1%，重新规范化
      if (Math.abs(currentSpeed - 360) > 3.6) {
        const ratio = 360 / currentSpeed;
        body.velocity.x *= ratio;
        body.velocity.y *= ratio;
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