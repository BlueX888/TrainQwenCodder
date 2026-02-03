class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.pooledCount = 0;
    this.activeCount = 0;
    this.recycledCount = 0;
  }

  preload() {
    // 使用 Graphics 生成白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('whiteBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 初始化可验证信号对象
    window.__signals__ = {
      pooledCount: 0,      // 对象池中对象总数
      activeCount: 0,      // 当前激活的对象数
      recycledCount: 0,    // 累计回收次数
      spawnCount: 0,       // 累计生成次数
      logs: []             // 事件日志
    };

    // 创建物理对象池，最大容量为 5
    this.objectPool = this.physics.add.group({
      defaultKey: 'whiteBox',
      maxSize: 5,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
        this.pooledCount++;
        this.logEvent('Object created in pool', { pooledCount: this.pooledCount });
      }
    });

    // 预创建 5 个对象到池中
    for (let i = 0; i < 5; i++) {
      const obj = this.objectPool.create(0, 0, 'whiteBox');
      obj.setActive(false);
      obj.setVisible(false);
    }

    window.__signals__.pooledCount = this.pooledCount;

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时从对象池获取对象并激活
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始发射 2 个对象
    this.spawnObject();
    this.time.delayedCall(500, () => this.spawnObject());
  }

  spawnObject() {
    // 从对象池获取可用对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置和速度
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(-50, 100);
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);

      // 激活对象
      obj.setPosition(x, y);
      obj.setActive(true);
      obj.setVisible(true);
      obj.setVelocity(velocityX, velocityY);

      this.activeCount = this.objectPool.countActive(true);
      window.__signals__.activeCount = this.activeCount;
      window.__signals__.spawnCount++;

      this.logEvent('Object spawned', {
        position: { x, y },
        velocity: { x: velocityX, y: velocityY },
        activeCount: this.activeCount,
        spawnCount: window.__signals__.spawnCount
      });
    } else {
      this.logEvent('Pool exhausted', { 
        maxSize: this.objectPool.maxSize,
        activeCount: this.activeCount
      });
    }
  }

  update(time, delta) {
    // 检查所有激活的对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界
        if (obj.y > 650 || obj.x < -50 || obj.x > 850 || obj.y < -50) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新状态显示
    this.activeCount = this.objectPool.countActive(true);
    window.__signals__.activeCount = this.activeCount;
    
    this.statusText.setText([
      `Pool Size: ${this.pooledCount}`,
      `Active: ${this.activeCount}`,
      `Recycled: ${this.recycledCount}`,
      `Spawned: ${window.__signals__.spawnCount}`,
      '',
      'White boxes spawn every second',
      'and recycle when off-screen'
    ]);
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    
    this.recycledCount++;
    window.__signals__.recycledCount = this.recycledCount;
    window.__signals__.activeCount = this.objectPool.countActive(true);

    this.logEvent('Object recycled', {
      position: { x: obj.x, y: obj.y },
      recycledCount: this.recycledCount,
      activeCount: window.__signals__.activeCount
    });
  }

  logEvent(event, data) {
    const logEntry = {
      timestamp: Date.now(),
      event: event,
      data: data
    };
    
    window.__signals__.logs.push(logEntry);
    
    // 保持日志数量在合理范围
    if (window.__signals__.logs.length > 50) {
      window.__signals__.logs.shift();
    }

    console.log(JSON.stringify(logEntry));
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