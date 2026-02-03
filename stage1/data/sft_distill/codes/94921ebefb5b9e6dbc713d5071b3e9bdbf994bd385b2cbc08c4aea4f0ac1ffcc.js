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
    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('whiteBox', 32, 32);
    graphics.destroy();

    // 创建对象池（使用 Physics.Arcade.Group）
    this.objectPool = this.physics.add.group({
      defaultKey: 'whiteBox',
      maxSize: 5,
      createCallback: (sprite) => {
        sprite.setActive(false);
        sprite.setVisible(false);
      }
    });

    // 初始化信号对象
    window.__signals__ = {
      recycleCount: 0,
      spawnCount: 0,
      activeCount: 0,
      poolSize: 5,
      events: []
    };

    // 定时生成对象（每 800ms）
    this.time.addEvent({
      delay: 800,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加说明文本
    this.add.text(10, 10, 'Object Pool Demo', {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.statsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#00ff00'
    });

    // 初始生成几个对象
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 300, () => this.spawnObject());
    }
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      this.spawnCount++;
      
      // 随机位置和速度
      const startX = Phaser.Math.Between(50, 750);
      const startY = -32;
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);

      obj.setPosition(startX, startY);
      obj.setVelocity(velocityX, velocityY);
      obj.setActive(true);
      obj.setVisible(true);

      // 记录事件
      window.__signals__.spawnCount = this.spawnCount;
      window.__signals__.events.push({
        type: 'spawn',
        timestamp: Date.now(),
        position: { x: startX, y: startY },
        velocity: { x: velocityX, y: velocityY }
      });

      console.log(`[SPAWN] Object spawned at (${startX}, ${startY}), Total: ${this.spawnCount}`);
    } else {
      console.log('[POOL] Pool is full, waiting for recycle');
    }
  }

  recycleObject(obj) {
    this.recycleCount++;
    
    // 回收对象
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);

    // 更新信号
    window.__signals__.recycleCount = this.recycleCount;
    window.__signals__.events.push({
      type: 'recycle',
      timestamp: Date.now(),
      position: { x: obj.x, y: obj.y }
    });

    console.log(`[RECYCLE] Object recycled, Total recycled: ${this.recycleCount}`);
  }

  update(time, delta) {
    // 检查所有活跃对象
    const children = this.objectPool.getChildren();
    let activeCount = 0;

    children.forEach((obj) => {
      if (obj.active) {
        activeCount++;
        
        // 检测是否离开屏幕
        if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新统计信息
    window.__signals__.activeCount = activeCount;
    
    this.statsText.setText([
      `Active Objects: ${activeCount}/5`,
      `Spawned: ${this.spawnCount}`,
      `Recycled: ${this.recycleCount}`,
      `Pool Available: ${5 - activeCount}`
    ]);

    // 每 5 秒输出一次完整状态
    if (Math.floor(time / 5000) !== this.lastLogTime) {
      this.lastLogTime = Math.floor(time / 5000);
      console.log('[SIGNALS]', JSON.stringify(window.__signals__, null, 2));
    }
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