class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;
    this.recycledCount = 0;
    this.totalSpawned = 0;
  }

  preload() {
    // 使用 Graphics 创建红色方块纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('redBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建对象池，最大15个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'redBox',
      maxSize: 15,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 创建显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每500ms发射一个）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取或创建对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置和速度
      const x = Phaser.Math.Between(50, 750);
      const y = 0;
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);

      obj.setPosition(x, y);
      obj.setVelocity(velocityX, velocityY);
      obj.setActive(true);
      obj.setVisible(true);
      obj.setAngularVelocity(Phaser.Math.Between(-200, 200));

      this.totalSpawned++;
      this.updateActiveCount();
    }
  }

  update() {
    // 检查所有活跃对象
    const objects = this.objectPool.getChildren();
    
    objects.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界（上下左右都检查）
        if (obj.y > 650 || obj.y < -50 || obj.x > 850 || obj.x < -50) {
          this.recycleObject(obj);
        }
      }
    });

    this.updateStatusText();
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    
    this.recycledCount++;
    this.updateActiveCount();
  }

  updateActiveCount() {
    // 统计活跃对象数量
    this.activeCount = this.objectPool.getChildren().filter(obj => obj.active).length;
  }

  updateStatusText() {
    this.statusText.setText([
      `Active Objects: ${this.activeCount} / 15`,
      `Recycled Count: ${this.recycledCount}`,
      `Total Spawned: ${this.totalSpawned}`,
      `Pool Size: ${this.objectPool.getLength()}`
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
  scene: PoolScene
};

new Phaser.Game(config);