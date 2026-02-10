class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.pooledCount = 0;
    this.activeCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建黄色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大 5 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'yellowBall',
      maxSize: 5,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setCollideWorldBounds(false);
        obj.body.setCircle(16);
      }
    });

    // 初始化信号对象
    window.__signals__ = {
      poolSize: 5,
      activeObjects: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      pooledObjects: 5,
      events: []
    };

    // 定时发射对象（每 800ms 发射一个）
    this.time.addEvent({
      delay: 800,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加提示文本
    this.add.text(10, 10, 'Object Pool Demo', {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.statusText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#00ff00'
    });

    this.logEvent('Pool initialized with max size: 5');
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 重置对象位置和速度
      obj.setPosition(
        Phaser.Math.Between(50, 750),
        -32
      );
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度
      obj.body.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(150, 300)
      );

      this.totalSpawned++;
      this.updateSignals();
      this.logEvent(`Object spawned at (${Math.floor(obj.x)}, ${Math.floor(obj.y)})`);
    } else {
      this.logEvent('Pool exhausted - waiting for recycling');
    }
  }

  update(time, delta) {
    // 检查活跃对象
    const activeObjects = this.objectPool.getChildren();
    
    activeObjects.forEach(obj => {
      if (!obj.active) return;

      // 检查是否离开屏幕边界
      const outOfBounds = 
        obj.y > 632 || // 下方
        obj.y < -32 || // 上方
        obj.x > 832 || // 右方
        obj.x < -32;   // 左方

      if (outOfBounds) {
        // 回收对象到池中
        this.recycleObject(obj);
      }
    });

    // 更新状态文本
    this.updateStatusText();
  }

  recycleObject(obj) {
    const x = Math.floor(obj.x);
    const y = Math.floor(obj.y);
    
    // 杀死并隐藏对象（回收到池中）
    this.objectPool.killAndHide(obj);
    obj.body.reset(0, 0);
    
    this.totalRecycled++;
    this.updateSignals();
    this.logEvent(`Object recycled from (${x}, ${y})`);
  }

  updateSignals() {
    const active = this.objectPool.countActive(true);
    const pooled = this.objectPool.getTotalFree();
    
    window.__signals__.activeObjects = active;
    window.__signals__.totalSpawned = this.totalSpawned;
    window.__signals__.totalRecycled = this.totalRecycled;
    window.__signals__.pooledObjects = pooled;
  }

  updateStatusText() {
    const active = this.objectPool.countActive(true);
    const pooled = this.objectPool.getTotalFree();
    
    this.statusText.setText([
      `Active Objects: ${active}/5`,
      `Pooled Objects: ${pooled}/5`,
      `Total Spawned: ${this.totalSpawned}`,
      `Total Recycled: ${this.totalRecycled}`
    ]);
  }

  logEvent(message) {
    const event = {
      timestamp: Date.now(),
      message: message
    };
    
    window.__signals__.events.push(event);
    
    // 保持最近 10 条事件
    if (window.__signals__.events.length > 10) {
      window.__signals__.events.shift();
    }
    
    console.log(`[Pool] ${message}`);
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