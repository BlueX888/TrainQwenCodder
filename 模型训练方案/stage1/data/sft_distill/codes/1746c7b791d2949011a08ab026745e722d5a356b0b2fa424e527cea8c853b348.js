class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.recycleCount = 0;
    this.spawnCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('orangeCircle', 40, 40);
    graphics.destroy();

    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'orangeCircle',
      maxSize: 5, // 最大5个对象
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setCircle(20); // 设置圆形碰撞体
      }
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

    // 定时发射对象（每秒1个）
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始化信号对象
    window.__signals__ = {
      activeObjects: 0,
      totalSpawned: 0,
      recycledCount: 0,
      poolSize: 5,
      timestamp: Date.now()
    };

    // 添加调试信息
    console.log(JSON.stringify({
      event: 'pool_initialized',
      maxSize: 5,
      timestamp: Date.now()
    }));
  }

  spawnObject() {
    // 从对象池获取或创建对象
    const obj = this.objectPool.get();
    
    if (obj) {
      this.spawnCount++;
      
      // 设置初始位置（屏幕左侧随机高度）
      const randomY = Phaser.Math.Between(100, 500);
      obj.setPosition(0, randomY);
      
      // 设置为激活状态
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置向右移动的速度
      obj.body.setVelocity(Phaser.Math.Between(100, 200), 0);
      
      // 更新信号
      this.updateSignals();
      
      console.log(JSON.stringify({
        event: 'object_spawned',
        totalSpawned: this.spawnCount,
        activeCount: this.objectPool.countActive(true),
        timestamp: Date.now()
      }));
    } else {
      console.log(JSON.stringify({
        event: 'pool_full',
        maxSize: 5,
        timestamp: Date.now()
      }));
    }
  }

  update() {
    // 检查所有激活的对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕右侧
        if (obj.x > this.scale.width + 50) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新状态文本
    const activeCount = this.objectPool.countActive(true);
    const totalCount = this.objectPool.getLength();
    
    this.statusText.setText([
      `Active Objects: ${activeCount}/${this.objectPool.maxSize}`,
      `Total Spawned: ${this.spawnCount}`,
      `Recycled: ${this.recycleCount}`,
      `Pool Size: ${totalCount}`
    ]);
  }

  recycleObject(obj) {
    this.recycleCount++;
    
    // 停止对象移动
    obj.body.setVelocity(0, 0);
    
    // 回收到对象池（kill 会将对象设为 inactive）
    obj.setActive(false);
    obj.setVisible(false);
    
    // 更新信号
    this.updateSignals();
    
    console.log(JSON.stringify({
      event: 'object_recycled',
      recycleCount: this.recycleCount,
      activeCount: this.objectPool.countActive(true),
      timestamp: Date.now()
    }));
  }

  updateSignals() {
    window.__signals__ = {
      activeObjects: this.objectPool.countActive(true),
      totalSpawned: this.spawnCount,
      recycledCount: this.recycleCount,
      poolSize: this.objectPool.maxSize,
      currentPoolLength: this.objectPool.getLength(),
      timestamp: Date.now()
    };
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

const game = new Phaser.Game(config);