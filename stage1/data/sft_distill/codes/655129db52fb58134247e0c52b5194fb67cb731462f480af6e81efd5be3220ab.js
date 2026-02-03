class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.poolStats = {
      totalSpawned: 0,
      totalRecycled: 0,
      activeCount: 0,
      poolSize: 5
    };
  }

  preload() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('orangeCircle', 32, 32);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      poolStats: this.poolStats,
      events: []
    };

    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'orangeCircle',
      maxSize: 5,
      runChildUpdate: false
    });

    // 预创建 5 个对象（初始化对象池）
    for (let i = 0; i < 5; i++) {
      const obj = this.objectPool.create(-100, -100, 'orangeCircle');
      obj.setActive(false);
      obj.setVisible(false);
    }

    // 添加屏幕边界文字提示
    this.add.text(10, 10, 'Object Pool Demo', {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.statsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#00ff00'
    });

    // 定时发射对象（每 1 秒）
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加点击发射功能
    this.input.on('pointerdown', () => {
      this.spawnObject();
    });

    this.logEvent('Game started', { poolSize: 5 });
  }

  spawnObject() {
    // 从对象池获取可用对象
    const obj = this.objectPool.get();

    if (obj) {
      // 重置对象位置和状态
      const startX = Phaser.Math.Between(50, 750);
      obj.setPosition(startX, 50);
      obj.setActive(true);
      obj.setVisible(true);

      // 设置随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(100, 300);
      obj.setVelocity(velocityX, velocityY);

      // 更新统计
      this.poolStats.totalSpawned++;
      this.poolStats.activeCount = this.objectPool.countActive(true);

      this.logEvent('Object spawned', {
        position: { x: startX, y: 50 },
        velocity: { x: velocityX, y: velocityY },
        activeCount: this.poolStats.activeCount
      });
    } else {
      this.logEvent('Pool exhausted', {
        activeCount: this.objectPool.countActive(true)
      });
    }
  }

  update(time, delta) {
    // 检查所有活动对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕
        if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新统计显示
    this.updateStatsDisplay();
  }

  recycleObject(obj) {
    // 回收对象到对象池
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    obj.setPosition(-100, -100);

    // 更新统计
    this.poolStats.totalRecycled++;
    this.poolStats.activeCount = this.objectPool.countActive(true);

    this.logEvent('Object recycled', {
      totalRecycled: this.poolStats.totalRecycled,
      activeCount: this.poolStats.activeCount
    });
  }

  updateStatsDisplay() {
    const activeCount = this.objectPool.countActive(true);
    const availableCount = this.poolStats.poolSize - activeCount;

    this.statsText.setText([
      `Total Spawned: ${this.poolStats.totalSpawned}`,
      `Total Recycled: ${this.poolStats.totalRecycled}`,
      `Active Objects: ${activeCount}/${this.poolStats.poolSize}`,
      `Available: ${availableCount}`,
      '',
      'Click to spawn object manually'
    ]);

    // 更新全局信号
    window.__signals__.poolStats = {
      ...this.poolStats,
      activeCount: activeCount,
      availableCount: availableCount
    };
  }

  logEvent(eventType, data) {
    const event = {
      timestamp: Date.now(),
      type: eventType,
      data: data
    };

    window.__signals__.events.push(event);

    // 保持最近 20 条事件
    if (window.__signals__.events.length > 20) {
      window.__signals__.events.shift();
    }

    // 输出日志 JSON
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
  scene: GameScene
};

new Phaser.Game(config);