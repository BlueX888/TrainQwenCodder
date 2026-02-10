class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('purpleBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      poolSize: 12,
      activeCount: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      availableInPool: 12
    };

    // 创建对象池（Physics Group）
    this.objectPool = this.physics.add.group({
      defaultKey: 'purpleBox',
      maxSize: 12,
      runChildUpdate: true,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 预创建12个对象到池中
    for (let i = 0; i < 12; i++) {
      const obj = this.objectPool.create(0, 0, 'purpleBox');
      obj.setActive(false);
      obj.setVisible(false);
    }

    // 定时发射对象（每500ms发射一个）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取一个不活跃的对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机生成位置和速度
      const x = Phaser.Math.Between(50, 750);
      const y = -50; // 从屏幕上方生成
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);

      obj.setPosition(x, y);
      obj.setActive(true);
      obj.setVisible(true);
      obj.body.setVelocity(velocityX, velocityY);

      this.totalSpawned++;
      this.activeCount = this.objectPool.countActive(true);

      // 更新信号
      window.__signals__.totalSpawned = this.totalSpawned;
      window.__signals__.activeCount = this.activeCount;
      window.__signals__.availableInPool = 12 - this.activeCount;

      console.log(JSON.stringify({
        event: 'spawn',
        totalSpawned: this.totalSpawned,
        activeCount: this.activeCount,
        position: { x, y }
      }));
    } else {
      console.log(JSON.stringify({
        event: 'pool_full',
        activeCount: this.activeCount
      }));
    }

    this.updateStatusText();
  }

  update(time, delta) {
    // 检查所有活跃对象是否离屏
    this.objectPool.getChildren().forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界（上下左右）
        if (obj.y > 650 || obj.y < -100 || obj.x < -100 || obj.x > 900) {
          this.recycleObject(obj);
        }
      }
    });
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.body.setVelocity(0, 0);

    this.totalRecycled++;
    this.activeCount = this.objectPool.countActive(true);

    // 更新信号
    window.__signals__.totalRecycled = this.totalRecycled;
    window.__signals__.activeCount = this.activeCount;
    window.__signals__.availableInPool = 12 - this.activeCount;

    console.log(JSON.stringify({
      event: 'recycle',
      totalRecycled: this.totalRecycled,
      activeCount: this.activeCount,
      availableInPool: 12 - this.activeCount
    }));

    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `对象池大小: 12`,
      `活跃对象: ${this.activeCount}`,
      `可用对象: ${12 - this.activeCount}`,
      `总发射数: ${this.totalSpawned}`,
      `总回收数: ${this.totalRecycled}`
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