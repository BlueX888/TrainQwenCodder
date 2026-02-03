class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.cycleCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建灰色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      activeObjects: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      cycleCount: 0,
      poolSize: 15,
      timestamp: Date.now()
    };

    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 15,
      runChildUpdate: true
    });

    // 添加显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 定时生成子弹（每200ms生成一个）
    this.spawnTimer = this.time.addEvent({
      delay: 200,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 定时输出统计信息（每500ms）
    this.logTimer = this.time.addEvent({
      delay: 500,
      callback: this.logStats,
      callbackScope: this,
      loop: true
    });

    // 初始日志
    this.logStats();
  }

  spawnBullet() {
    // 从对象池获取子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      // 随机生成位置（使用确定性随机）
      const seed = this.totalSpawned % 100;
      const x = 100 + (seed * 7) % 600;
      const y = 50 + (seed * 13) % 100;
      
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(x, y);
      
      // 设置随机速度
      const velocityX = -50 + (seed * 11) % 100;
      const velocityY = 100 + (seed * 17) % 200;
      bullet.setVelocity(velocityX, velocityY);
      
      this.totalSpawned++;
      this.cycleCount++;
      
      // 更新信号
      this.updateSignals();
    }
  }

  update(time, delta) {
    // 检查并回收超出边界的子弹
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 检查是否超出屏幕边界
        if (bullet.y > 650 || bullet.x < -50 || bullet.x > 850) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新显示文本
    this.updateStatusText();
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    this.totalRecycled++;
    this.updateSignals();
  }

  updateStatusText() {
    const activeCount = this.bulletPool.countActive(true);
    const inactiveCount = this.bulletPool.countActive(false);
    
    this.statusText.setText([
      `=== 对象池压力测试 ===`,
      `活动对象: ${activeCount}`,
      `池中对象: ${inactiveCount}`,
      `池总大小: ${this.bulletPool.maxSize}`,
      `总生成数: ${this.totalSpawned}`,
      `总回收数: ${this.totalRecycled}`,
      `当前周期: ${this.cycleCount}`,
      `时间: ${Math.floor(this.time.now / 1000)}s`
    ].join('\n'));
  }

  updateSignals() {
    const activeCount = this.bulletPool.countActive(true);
    
    window.__signals__ = {
      activeObjects: activeCount,
      totalSpawned: this.totalSpawned,
      totalRecycled: this.totalRecycled,
      cycleCount: this.cycleCount,
      poolSize: this.bulletPool.maxSize,
      poolUtilization: (activeCount / this.bulletPool.maxSize * 100).toFixed(2) + '%',
      timestamp: Date.now()
    };
  }

  logStats() {
    const stats = {
      timestamp: Date.now(),
      activeObjects: this.bulletPool.countActive(true),
      inactiveObjects: this.bulletPool.countActive(false),
      totalSpawned: this.totalSpawned,
      totalRecycled: this.totalRecycled,
      cycleCount: this.cycleCount,
      poolMaxSize: this.bulletPool.maxSize
    };
    
    console.log('[POOL_TEST]', JSON.stringify(stats));
    
    // 重置周期计数
    this.cycleCount = 0;
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

const game = new Phaser.Game(config);