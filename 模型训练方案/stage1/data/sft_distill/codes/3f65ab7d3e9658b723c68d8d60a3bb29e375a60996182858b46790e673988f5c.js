class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeObjects = 0; // 状态信号：活跃物体数量
    this.totalCollisions = 0; // 状态信号：总碰撞次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 使用 Graphics 生成紫色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932CC, 1); // 紫色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('purpleCircle', 40, 40);
    graphics.destroy();

    // 创建物理组
    this.purpleGroup = this.physics.add.group({
      key: 'purpleCircle',
      repeat: 9, // 创建10个物体（0-9）
      setXY: {
        x: 100,
        y: 100,
        stepX: 70,
        stepY: 0
      }
    });

    // 为每个物体设置属性
    this.purpleGroup.children.iterate((child) => {
      // 设置反弹系数
      child.setBounce(1);
      
      // 设置世界边界碰撞
      child.setCollideWorldBounds(true);
      
      // 设置随机速度（速度大小为200）
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 200;
      const velocityY = Math.sin(angle) * 200;
      child.setVelocity(velocityX, velocityY);
      
      // 随机初始位置
      child.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );
    });

    // 设置物体间碰撞
    this.physics.add.collider(
      this.purpleGroup,
      this.purpleGroup,
      this.handleCollision,
      null,
      this
    );

    // 更新活跃物体数量
    this.activeObjects = this.purpleGroup.getLength();

    // 添加文本显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加调试信息
    console.log('Game initialized with', this.activeObjects, 'purple objects');
  }

  handleCollision(obj1, obj2) {
    // 碰撞回调，增加碰撞计数
    this.totalCollisions++;
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Total Collisions: ${this.totalCollisions}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 确保所有物体保持恒定速度（200）
    this.purpleGroup.children.iterate((child) => {
      const currentSpeed = Math.sqrt(
        child.body.velocity.x ** 2 + child.body.velocity.y ** 2
      );
      
      // 如果速度偏差过大，重新归一化到200
      if (Math.abs(currentSpeed - 200) > 1) {
        const scale = 200 / currentSpeed;
        child.setVelocity(
          child.body.velocity.x * scale,
          child.body.velocity.y * scale
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);