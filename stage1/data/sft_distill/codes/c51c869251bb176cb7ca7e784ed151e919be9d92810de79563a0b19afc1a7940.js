class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：碰撞计数
    this.activeObjects = 0;  // 状态信号：活动物体数量
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
    this.greenGroup = this.physics.add.group({
      key: 'greenCircle',
      repeat: 19, // 创建 20 个物体（0-19）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 设置每个物体的初始位置和随机速度
    const objects = this.greenGroup.getChildren();
    this.activeObjects = objects.length;

    objects.forEach((obj, index) => {
      // 随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      obj.setPosition(x, y);

      // 随机方向，固定速度 80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      obj.setVelocity(velocityX, velocityY);

      // 设置圆形碰撞体
      obj.body.setCircle(16);
    });

    // 启用组内物体相互碰撞
    this.physics.add.collider(this.greenGroup, this.greenGroup, this.handleCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加调试信息（可选）
    console.log('Game Started: 20 green objects created');
    console.log('Each object velocity magnitude: 80');
  }

  handleCollision(obj1, obj2) {
    // 碰撞回调
    this.collisionCount++;
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Collisions: ${this.collisionCount}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 验证速度保持在 80 左右（允许微小误差）
    const objects = this.greenGroup.getChildren();
    objects.forEach(obj => {
      const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
      
      // 如果速度偏离 80 太多，重新归一化（处理浮点误差）
      if (Math.abs(speed - 80) > 1) {
        const angle = Math.atan2(obj.body.velocity.y, obj.body.velocity.x);
        obj.setVelocity(Math.cos(angle) * 80, Math.sin(angle) * 80);
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

const game = new Phaser.Game(config);