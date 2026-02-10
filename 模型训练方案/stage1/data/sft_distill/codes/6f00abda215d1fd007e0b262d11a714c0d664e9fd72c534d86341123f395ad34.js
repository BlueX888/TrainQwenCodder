class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.cycleCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建蓝色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 初始化信号输出
    window.__signals__ = {
      activeCount: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      cycleCount: 0,
      poolSize: 3,
      events: []
    };

    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 3,
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 添加文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 定时生成子弹（每500ms生成一个）
    this.spawnTimer = this.time.addEvent({
      delay: 500,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新显示
    this.updateStatus();

    // 记录初始状态
    this.logEvent('POOL_INITIALIZED', { maxSize: 3 });
  }

  spawnBullet() {
    this.cycleCount++;

    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get(100, 300);
    
    if (bullet) {
      this.totalSpawned++;
      
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityX(200);
      bullet.setVelocityY(Phaser.Math.Between(-50, 50));

      this.logEvent('BULLET_SPAWNED', {
        totalSpawned: this.totalSpawned,
        activeCount: this.bulletPool.countActive(true)
      });
    } else {
      // 池已满，无法生成
      this.logEvent('POOL_FULL', {
        activeCount: this.bulletPool.countActive(true)
      });
    }

    this.updateStatus();
  }

  update() {
    // 检查并回收超出屏幕的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.x > 850) {
        this.recycleBullet(bullet);
      }
    });
  }

  recycleBullet(bullet) {
    this.totalRecycled++;
    
    // 回收到池中
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    bullet.setPosition(100, 300);

    this.logEvent('BULLET_RECYCLED', {
      totalRecycled: this.totalRecycled,
      activeCount: this.bulletPool.countActive(true)
    });

    this.updateStatus();
  }

  updateStatus() {
    const activeCount = this.bulletPool.countActive(true);
    const inactiveCount = this.bulletPool.countActive(false);
    const totalCount = this.bulletPool.getLength();

    // 更新文本显示
    const status = [
      `=== Object Pool Stress Test ===`,
      `Pool Size: ${totalCount} / ${this.bulletPool.maxSize}`,
      `Active Objects: ${activeCount}`,
      `Inactive Objects: ${inactiveCount}`,
      ``,
      `Total Spawned: ${this.totalSpawned}`,
      `Total Recycled: ${this.totalRecycled}`,
      `Cycle Count: ${this.cycleCount}`,
      ``,
      `Memory Efficiency: ${totalCount <= 3 ? 'GOOD ✓' : 'BAD ✗'}`
    ].join('\n');

    this.statusText.setText(status);

    // 更新全局信号
    window.__signals__.activeCount = activeCount;
    window.__signals__.totalSpawned = this.totalSpawned;
    window.__signals__.totalRecycled = this.totalRecycled;
    window.__signals__.cycleCount = this.cycleCount;
    window.__signals__.poolSize = totalCount;

    // 输出到控制台
    console.log(JSON.stringify({
      timestamp: Date.now(),
      activeCount,
      inactiveCount,
      totalCount,
      totalSpawned: this.totalSpawned,
      totalRecycled: this.totalRecycled,
      cycleCount: this.cycleCount
    }));
  }

  logEvent(eventType, data) {
    const event = {
      timestamp: Date.now(),
      type: eventType,
      ...data
    };
    
    window.__signals__.events.push(event);
    
    // 只保留最近20条事件
    if (window.__signals__.events.length > 20) {
      window.__signals__.events.shift();
    }

    console.log(`[${eventType}]`, JSON.stringify(data));
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
  scene: PoolTestScene
};

new Phaser.Game(config);