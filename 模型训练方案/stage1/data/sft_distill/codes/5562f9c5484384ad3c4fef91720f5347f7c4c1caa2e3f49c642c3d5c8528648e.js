// 对象池压力测试场景
class ObjectPoolStressTestScene extends Phaser.Scene {
  constructor() {
    super('ObjectPoolStressTestScene');
    this.cycleCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建灰色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x808080, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 初始化信号输出
    window.__signals__ = {
      activeObjects: 0,
      poolSize: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      cycleCount: 0,
      maxReached: false,
      logs: []
    };

    // 创建对象池（物理组）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 15, // 最大15个对象
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
        this.log('Object created in pool');
      }
    });

    // 添加文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
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

    // 每秒更新一次统计信息
    this.statsTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateStats,
      callbackScope: this,
      loop: true
    });

    this.log('Object pool initialized with max size: 15');
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 150)
    );

    if (bullet) {
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(100, 300);
      bullet.setVelocity(velocityX, velocityY);

      this.totalSpawned++;
      this.cycleCount++;

      this.log(`Bullet spawned #${this.totalSpawned} at (${Math.round(bullet.x)}, ${Math.round(bullet.y)})`);

      // 检查是否达到最大值
      if (this.bulletPool.getLength() >= 15) {
        window.__signals__.maxReached = true;
        this.log('Pool max size reached (15 objects)');
      }
    } else {
      this.log('Pool exhausted - waiting for recycling');
    }
  }

  update() {
    // 检查并回收超出屏幕的子弹
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 子弹离开屏幕边界则回收
        if (bullet.y > 650 || bullet.x < -50 || bullet.x > 850) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新显示文本
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    
    this.statusText.setText([
      `=== Object Pool Stress Test ===`,
      `Active Objects: ${activeCount}`,
      `Pool Size: ${totalCount} / 15`,
      `Total Spawned: ${this.totalSpawned}`,
      `Total Recycled: ${this.totalRecycled}`,
      `Cycle Count: ${this.cycleCount}`,
      `Max Reached: ${window.__signals__.maxReached ? 'YES' : 'NO'}`,
      ``,
      `Press SPACE to spawn manually`
    ]);

    // 更新信号
    window.__signals__.activeObjects = activeCount;
    window.__signals__.poolSize = totalCount;
    window.__signals__.totalSpawned = this.totalSpawned;
    window.__signals__.totalRecycled = this.totalRecycled;
    window.__signals__.cycleCount = this.cycleCount;
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    this.totalRecycled++;
    this.log(`Bullet recycled #${this.totalRecycled} - returned to pool`);
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    
    this.log(`[STATS] Active: ${activeCount}, Pool: ${totalCount}, Spawned: ${this.totalSpawned}, Recycled: ${this.totalRecycled}`);
  }

  log(message) {
    const timestamp = this.time.now;
    const logEntry = {
      time: Math.round(timestamp),
      message: message
    };
    
    console.log(`[${logEntry.time}ms] ${message}`);
    
    if (window.__signals__.logs.length < 100) {
      window.__signals__.logs.push(logEntry);
    }
  }
}

// 游戏配置
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
  scene: ObjectPoolStressTestScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始信号
console.log('Object Pool Stress Test Started');
console.log('Monitoring window.__signals__ for real-time data');