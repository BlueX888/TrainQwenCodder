class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycleCount = 0;     // 总回收次数
    this.spawnCount = 0;       // 总生成次数
  }

  preload() {
    // 创建灰色方块纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('grayBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建对象池，最多 12 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'grayBox',
      maxSize: 12,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
        obj.body.enable = false;
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时生成对象（每 500ms 生成一个）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始生成几个对象
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 100, () => this.spawnObject());
    }
  }

  spawnObject() {
    // 从对象池获取或创建对象
    let obj = this.objectPool.get();
    
    if (!obj) {
      // 如果池已满且没有可用对象，不创建新对象
      return;
    }

    // 激活对象
    obj.setActive(true);
    obj.setVisible(true);
    obj.body.enable = true;

    // 随机位置和速度
    const startX = Phaser.Math.Between(50, 750);
    const startY = -50;
    const velocityX = Phaser.Math.Between(-100, 100);
    const velocityY = Phaser.Math.Between(100, 200);

    obj.setPosition(startX, startY);
    obj.setVelocity(velocityX, velocityY);
    obj.setAngularVelocity(Phaser.Math.Between(-180, 180));

    this.spawnCount++;
    this.activeCount++;
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.body.enable = false;
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    obj.setRotation(0);

    this.recycleCount++;
    this.activeCount--;
  }

  update(time, delta) {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕
        if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新状态显示
    const poolSize = this.objectPool.getLength();
    const totalUsed = this.objectPool.getTotalUsed();
    
    this.statusText.setText([
      `Pool Size: ${poolSize} / 12`,
      `Active Objects: ${this.activeCount}`,
      `Total Spawned: ${this.spawnCount}`,
      `Total Recycled: ${this.recycleCount}`,
      `Pool Used: ${totalUsed}`,
      `Reuse Rate: ${this.spawnCount > 0 ? Math.floor((this.recycleCount / this.spawnCount) * 100) : 0}%`
    ]);
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