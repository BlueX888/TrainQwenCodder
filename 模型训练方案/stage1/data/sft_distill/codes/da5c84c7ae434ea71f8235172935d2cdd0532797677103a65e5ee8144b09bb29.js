class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;
    this.recycledCount = 0;
    this.spawnCount = 0;
  }

  preload() {
    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('whiteBlock', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理组作为对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'whiteBlock',
      maxSize: 8,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 预创建8个对象
    for (let i = 0; i < 8; i++) {
      const obj = this.objectPool.create(0, 0, 'whiteBlock');
      obj.setActive(false);
      obj.setVisible(false);
    }

    // 定时发射对象
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化信号对象
    window.__signals__ = {
      activeCount: 0,
      recycledCount: 0,
      spawnCount: 0,
      poolSize: 8,
      events: []
    };

    this.updateStatus();
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置和速度
      const startX = Phaser.Math.Between(50, 750);
      const startY = -50;
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);

      obj.setPosition(startX, startY);
      obj.setVelocity(velocityX, velocityY);
      obj.setActive(true);
      obj.setVisible(true);

      this.spawnCount++;
      this.activeCount = this.objectPool.countActive(true);

      // 记录发射事件
      window.__signals__.spawnCount = this.spawnCount;
      window.__signals__.activeCount = this.activeCount;
      window.__signals__.events.push({
        type: 'spawn',
        time: this.time.now,
        position: { x: startX, y: startY }
      });

      this.updateStatus();
    }
  }

  update() {
    // 检查活跃对象是否离屏
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界
        if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
          this.recycleObject(obj);
        }
      }
    });
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);

    this.recycledCount++;
    this.activeCount = this.objectPool.countActive(true);

    // 记录回收事件
    window.__signals__.recycledCount = this.recycledCount;
    window.__signals__.activeCount = this.activeCount;
    window.__signals__.events.push({
      type: 'recycle',
      time: this.time.now,
      position: { x: obj.x, y: obj.y }
    });

    this.updateStatus();

    // 输出日志
    console.log(JSON.stringify({
      event: 'recycle',
      recycledCount: this.recycledCount,
      activeCount: this.activeCount
    }));
  }

  updateStatus() {
    const totalInPool = this.objectPool.getLength();
    const activeInPool = this.objectPool.countActive(true);
    const inactiveInPool = this.objectPool.countActive(false);

    this.statusText.setText([
      `Pool Size: ${totalInPool}/8`,
      `Active: ${activeInPool}`,
      `Inactive: ${inactiveInPool}`,
      `Spawned: ${this.spawnCount}`,
      `Recycled: ${this.recycledCount}`
    ]);

    // 更新全局信号
    window.__signals__.poolSize = totalInPool;
    window.__signals__.activeCount = activeInPool;
    window.__signals__.inactiveCount = inactiveInPool;
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