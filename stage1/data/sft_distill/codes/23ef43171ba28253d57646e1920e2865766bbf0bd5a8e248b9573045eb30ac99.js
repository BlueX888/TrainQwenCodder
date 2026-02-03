class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      objectCount: 20,
      collisionCount: 0,
      averageSpeed: 80,
      bounceEnabled: true
    };

    // 创建蓝色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillCircle(16, 16, 16); // 半径16的圆
    graphics.generateTexture('blueCircle', 32, 32);
    graphics.destroy();

    // 创建物理组
    this.blueObjects = this.physics.add.group({
      key: 'blueCircle',
      repeat: 19, // 创建20个物体（1个默认 + 19个重复）
      setXY: {
        x: 100,
        y: 100,
        stepX: 0,
        stepY: 0
      }
    });

    // 为每个物体设置随机位置、速度和反弹
    this.blueObjects.children.iterate((object) => {
      // 随机位置
      object.x = Phaser.Math.Between(50, 750);
      object.y = Phaser.Math.Between(50, 550);

      // 设置完全反弹
      object.setBounce(1, 1);

      // 设置随机方向的速度，总速度为80
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const velocityX = Math.cos(angle) * 80;
      const velocityY = Math.sin(angle) * 80;
      object.setVelocity(velocityX, velocityY);

      // 启用世界边界碰撞
      object.setCollideWorldBounds(true);

      // 设置圆形碰撞体
      object.body.setCircle(16);
    });

    // 设置物体间的碰撞检测
    this.physics.add.collider(
      this.blueObjects,
      this.blueObjects,
      this.handleCollision,
      null,
      this
    );

    // 显示信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateInfoText();
  }

  handleCollision(obj1, obj2) {
    // 记录碰撞次数
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;

    // 输出碰撞日志（JSON格式）
    console.log(JSON.stringify({
      type: 'collision',
      count: this.collisionCount,
      timestamp: Date.now(),
      obj1: { x: Math.round(obj1.x), y: Math.round(obj1.y) },
      obj2: { x: Math.round(obj2.x), y: Math.round(obj2.y) }
    }));
  }

  update(time, delta) {
    // 更新信息显示
    if (time % 100 < delta) { // 每100ms更新一次
      this.updateInfoText();
    }

    // 计算平均速度并更新信号
    let totalSpeed = 0;
    let count = 0;
    this.blueObjects.children.iterate((object) => {
      const speed = Math.sqrt(
        object.body.velocity.x ** 2 + 
        object.body.velocity.y ** 2
      );
      totalSpeed += speed;
      count++;
    });
    
    window.__signals__.averageSpeed = Math.round(totalSpeed / count);
  }

  updateInfoText() {
    this.infoText.setText([
      `Objects: ${window.__signals__.objectCount}`,
      `Collisions: ${window.__signals__.collisionCount}`,
      `Avg Speed: ${window.__signals__.averageSpeed}`,
      `Bounce: ${window.__signals__.bounceEnabled ? 'ON' : 'OFF'}`
    ]);
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);