class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0; // 状态信号：记录碰撞次数
    this.activeObjects = 10; // 状态信号：活跃物体数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成青色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('cyanBall', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.cyanGroup = this.physics.add.group({
      key: 'cyanBall',
      repeat: 9, // 创建10个物体（0-9）
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true
    });

    // 为每个物体设置随机位置和随机速度
    const objects = this.cyanGroup.getChildren();
    objects.forEach((obj, index) => {
      // 随机位置（避免重叠）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      obj.setPosition(x, y);

      // 设置随机速度方向，但保持速度大小为80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      obj.setVelocity(velocityX, velocityY);

      // 设置碰撞体
      obj.body.setCircle(20);
    });

    // 设置组内物体相互碰撞
    this.physics.add.collider(this.cyanGroup, this.cyanGroup, this.onCollision, null, this);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加调试信息
    console.log('游戏开始：10个青色物体已创建，速度为80');
  }

  onCollision(obj1, obj2) {
    // 碰撞回调函数
    this.collisionCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText(
      `活跃物体: ${this.activeObjects}\n` +
      `碰撞次数: ${this.collisionCount}\n` +
      `速度: 80`
    );
  }

  update(time, delta) {
    // 验证物体速度保持在80左右（考虑浮点误差）
    const objects = this.cyanGroup.getChildren();
    objects.forEach(obj => {
      const speed = Math.sqrt(obj.body.velocity.x ** 2 + obj.body.velocity.y ** 2);
      
      // 如果速度偏离80太多，重新归一化
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