class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;
    this.totalSpawned = 0;
    this.recycledCount = 0;
  }

  preload() {
    // 创建紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('purpleBlock', 32, 32);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      poolSize: 12,
      activeObjects: 0,
      totalSpawned: 0,
      recycledCount: 0,
      events: []
    };

    // 创建物理对象池，最大 12 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'purpleBlock',
      maxSize: 12,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
        this.logEvent('POOL_OBJECT_CREATED', { total: this.objectPool.getLength() });
      }
    });

    // 预创建池中的所有对象
    for (let i = 0; i < 12; i++) {
      const obj = this.objectPool.create(0, 0, 'purpleBlock');
      obj.setActive(false);
      obj.setVisible(false);
    }

    // 定时发射对象（每 500ms 发射一个）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加文本显示状态
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
      // 随机从顶部或左侧生成
      const fromTop = Math.random() > 0.5;
      
      if (fromTop) {
        obj.setPosition(Phaser.Math.Between(50, 750), -32);
        obj.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(100, 200));
      } else {
        obj.setPosition(-32, Phaser.Math.Between(50, 550));
        obj.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(-50, 50));
      }

      obj.setActive(true);
      obj.setVisible(true);
      
      this.totalSpawned++;
      this.activeCount = this.objectPool.countActive(true);
      
      this.logEvent('OBJECT_SPAWNED', {
        id: obj.body.id,
        position: { x: obj.x, y: obj.y },
        velocity: { x: obj.body.velocity.x, y: obj.body.velocity.y }
      });
      
      this.updateStatusText();
    } else {
      this.logEvent('POOL_FULL', { activeCount: this.activeCount });
    }
  }

  update() {
    // 检查所有活跃对象是否离屏
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界（留一些缓冲区）
        const outOfBounds = 
          obj.x < -50 || 
          obj.x > 850 || 
          obj.y < -50 || 
          obj.y > 650;

        if (outOfBounds) {
          this.recycleObject(obj);
        }
      }
    });
  }

  recycleObject(obj) {
    const objId = obj.body.id;
    const position = { x: obj.x, y: obj.y };
    
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    obj.setPosition(0, 0);
    
    this.recycledCount++;
    this.activeCount = this.objectPool.countActive(true);
    
    this.logEvent('OBJECT_RECYCLED', {
      id: objId,
      lastPosition: position,
      recycledCount: this.recycledCount
    });
    
    this.updateStatusText();
  }

  updateStatusText() {
    const active = this.objectPool.countActive(true);
    const inactive = this.objectPool.countActive(false);
    const total = this.objectPool.getLength();
    
    this.statusText.setText([
      `对象池状态:`,
      `总容量: ${total}/12`,
      `活跃对象: ${active}`,
      `空闲对象: ${inactive}`,
      `已发射: ${this.totalSpawned}`,
      `已回收: ${this.recycledCount}`,
      `复用率: ${this.totalSpawned > 0 ? ((this.recycledCount / this.totalSpawned) * 100).toFixed(1) : 0}%`
    ]);

    // 更新全局信号
    window.__signals__.activeObjects = active;
    window.__signals__.totalSpawned = this.totalSpawned;
    window.__signals__.recycledCount = this.recycledCount;
  }

  logEvent(type, data) {
    const event = {
      timestamp: Date.now(),
      type: type,
      data: data
    };
    
    window.__signals__.events.push(event);
    
    // 只保留最近 50 条事件
    if (window.__signals__.events.length > 50) {
      window.__signals__.events.shift();
    }
    
    console.log(`[${type}]`, JSON.stringify(data));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: PoolScene
};

const game = new Phaser.Game(config);