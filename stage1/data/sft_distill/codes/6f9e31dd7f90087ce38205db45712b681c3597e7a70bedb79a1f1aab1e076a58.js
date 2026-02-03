// 对象池压力测试 - 橙色子弹生成与回收
class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.spawnCount = 0;
    this.recycleCount = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      activeCount: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      poolSize: 12,
      logs: []
    };

    // 创建橙色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12, // 最大12个对象
      runChildUpdate: true
    });

    // 创建显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 设置定时器：每100ms生成一个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 100,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新显示
    this.updateDisplay();

    // 记录初始状态
    this.logState('Scene created, object pool initialized');
  }

  spawnBullet() {
    // 从对象池获取子弹（如果池已满，会复用最早的对象）
    const bullet = this.bulletPool.get(
      Phaser.Math.Between(50, 750), // 随机X位置
      -20 // 从屏幕上方生成
    );

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(200); // 向下移动
      
      this.spawnCount++;
      
      // 更新信号
      this.updateSignals();
      this.logState(`Bullet spawned at x=${Math.round(bullet.x)}`);
    }
  }

  update() {
    // 检查并回收超出屏幕的子弹
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y > 620) {
        this.recycleBullet(bullet);
      }
    });

    // 更新显示
    this.updateDisplay();
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    this.recycleCount++;
    
    // 更新信号
    this.updateSignals();
    this.logState(`Bullet recycled, total recycled=${this.recycleCount}`);
  }

  updateDisplay() {
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    
    this.statusText.setText([
      `=== Object Pool Stress Test ===`,
      `Active Objects: ${activeCount}`,
      `Pool Size: ${totalCount}/${this.bulletPool.maxSize}`,
      `Total Spawned: ${this.spawnCount}`,
      `Total Recycled: ${this.recycleCount}`,
      `Net Objects: ${this.spawnCount - this.recycleCount}`,
      ``,
      `Status: ${activeCount === 12 ? 'POOL FULL' : 'Running'}`
    ]);
  }

  updateSignals() {
    const activeCount = this.bulletPool.countActive(true);
    
    window.__signals__.activeCount = activeCount;
    window.__signals__.totalSpawned = this.spawnCount;
    window.__signals__.totalRecycled = this.recycleCount;
    window.__signals__.poolSize = this.bulletPool.getLength();
  }

  logState(message) {
    const logEntry = {
      timestamp: Date.now(),
      frame: this.game.loop.frame,
      message: message,
      activeCount: this.bulletPool.countActive(true),
      totalSpawned: this.spawnCount,
      totalRecycled: this.recycleCount
    };
    
    window.__signals__.logs.push(logEntry);
    
    // 只保留最近50条日志
    if (window.__signals__.logs.length > 50) {
      window.__signals__.logs.shift();
    }
    
    console.log(JSON.stringify(logEntry));
  }
}

// Phaser 游戏配置
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
  scene: BulletPoolScene,
  seed: [42] // 固定随机种子以保证确定性
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出验证接口
window.__getPoolStats__ = function() {
  return {
    signals: window.__signals__,
    summary: {
      isPoolFull: window.__signals__.activeCount >= 12,
      recyclingWorking: window.__signals__.totalRecycled > 0,
      noMemoryLeak: window.__signals__.poolSize <= 12
    }
  };
};

// 5秒后输出统计信息
setTimeout(() => {
  console.log('=== Pool Statistics After 5 Seconds ===');
  console.log(JSON.stringify(window.__getPoolStats__(), null, 2));
}, 5000);