class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.activeObjects = 8; // 状态信号：活动物体数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('whiteCircle', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.objectGroup = this.physics.add.group({
      defaultKey: 'whiteCircle',
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 创建 8 个物体并设置随机速度
    const speed = 200;
    for (let i = 0; i < 8; i++) {
      // 随机位置（避免边缘生成）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const obj = this.objectGroup.create(x, y, 'whiteCircle');
      
      // 设置随机速度方向
      const angle = Phaser.Math.Between(0, 360);
      const velocityX = Math.cos(angle * Math.PI / 180) * speed;
      const velocityY = Math.sin(angle * Math.PI / 180) * speed;
      
      obj.setVelocity(velocityX, velocityY);
      obj.setCircle(16); // 设置圆形碰撞体
    }

    // 设置物体之间的碰撞
    this.physics.add.collider(
      this.objectGroup,
      this.objectGroup,
      this.handleCollision,
      null,
      this
    );

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
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

  handleCollision(obj1, obj2) {
    // 物体间碰撞计数
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Total Collisions: ${this.collisionCount}`,
      `Speed: 200 px/s`
    ]);
  }

  update(time, delta) {
    // 验证物体速度保持在 200 左右（考虑浮点误差）
    this.objectGroup.getChildren().forEach(obj => {
      const body = obj.body;
      const currentSpeed = Math.sqrt(
        body.velocity.x * body.velocity.x + 
        body.velocity.y * body.velocity.y
      );
      
      // 如果速度偏离 200 太多，重新归一化
      if (Math.abs(currentSpeed - 200) > 1) {
        const scale = 200 / currentSpeed;
        body.setVelocity(
          body.velocity.x * scale,
          body.velocity.y * scale
        );
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