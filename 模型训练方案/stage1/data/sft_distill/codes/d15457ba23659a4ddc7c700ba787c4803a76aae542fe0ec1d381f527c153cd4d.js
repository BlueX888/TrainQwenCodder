class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.pooledCount = 0;
    this.activeCount = 0;
    this.recycledCount = 0;
  }

  preload() {
    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      poolSize: 5,
      maxSize: 5,
      activeObjects: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      events: []
    };

    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'yellowBall',
      maxSize: 5,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
        this.pooledCount++;
        this.logEvent('POOL_CREATED', { pooledCount: this.pooledCount });
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Object Pool Demo (Max: 5)', {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.statusText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#00ff00'
    });

    // 定时发射对象（每 800ms）
    this.time.addEvent({
      delay: 800,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始发射 3 个对象
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 300, () => this.spawnObject());
    }
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 激活并设置初始位置和速度
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(
        Phaser.Math.Between(50, 750),
        -32
      );
      obj.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(150, 300)
      );
      obj.setBounce(0.8);
      obj.setCollideWorldBounds(false);

      this.activeCount++;
      window.__signals__.totalSpawned++;
      window.__signals__.activeObjects = this.objectPool.countActive(true);

      this.logEvent('OBJECT_SPAWNED', {
        x: obj.x,
        y: obj.y,
        velocityX: obj.body.velocity.x,
        velocityY: obj.body.velocity.y,
        activeCount: this.activeCount,
        poolAvailable: this.objectPool.getTotalFree()
      });
    } else {
      this.logEvent('POOL_EXHAUSTED', {
        activeCount: this.objectPool.countActive(true),
        totalUsed: this.objectPool.getLength()
      });
    }
  }

  update(time, delta) {
    // 检查并回收离开屏幕的对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界
        if (obj.y > 632 || obj.x < -32 || obj.x > 832) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新状态显示
    const activeCount = this.objectPool.countActive(true);
    const totalFree = this.objectPool.getTotalFree();
    
    this.statusText.setText([
      `Active: ${activeCount}`,
      `Available: ${totalFree}`,
      `Total Spawned: ${window.__signals__.totalSpawned}`,
      `Total Recycled: ${window.__signals__.totalRecycled}`
    ]);

    window.__signals__.activeObjects = activeCount;
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.body.stop();
    
    this.activeCount--;
    this.recycledCount++;
    window.__signals__.totalRecycled++;
    window.__signals__.activeObjects = this.objectPool.countActive(true);

    this.logEvent('OBJECT_RECYCLED', {
      recycledCount: this.recycledCount,
      activeCount: this.activeCount,
      poolAvailable: this.objectPool.getTotalFree()
    });
  }

  logEvent(eventType, data) {
    const event = {
      timestamp: Date.now(),
      type: eventType,
      ...data
    };
    
    window.__signals__.events.push(event);
    
    // 保持最近 20 条事件
    if (window.__signals__.events.length > 20) {
      window.__signals__.events.shift();
    }

    console.log(JSON.stringify(event));
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