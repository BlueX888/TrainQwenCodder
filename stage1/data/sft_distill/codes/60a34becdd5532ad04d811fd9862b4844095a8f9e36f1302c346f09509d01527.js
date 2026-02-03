// 对象池压力测试 - 持续生成/回收橙色子弹
class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.spawnCount = 0;
    this.recycleCount = 0;
    this.maxBullets = 12;
  }

  preload() {
    // 创建橙色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillCircle(8, 8, 8); // 半径8的圆形
    graphics.generateTexture('orangeBullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 初始化信号输出
    window.__signals__ = {
      activeCount: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      poolSize: this.maxBullets,
      timestamp: Date.now()
    };

    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'orangeBullet',
      maxSize: this.maxBullets,
      runChildUpdate: true
    });

    // 显示统计信息
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 定时生成子弹（每200ms）
    this.spawnTimer = this.time.addEvent({
      delay: 200,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 每100ms更新统计信息
    this.time.addEvent({
      delay: 100,
      callback: this.updateStats,
      callbackScope: this,
      loop: true
    });

    // 添加说明文本
    this.add.text(10, 550, 'Object Pool Test: Spawning/Recycling 12 orange bullets', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      this.spawnCount++;
      
      // 随机X位置（使用固定种子的伪随机）
      const seed = this.spawnCount * 1234567;
      const pseudoRandom = Math.abs(Math.sin(seed)) * 10000;
      const x = 50 + (pseudoRandom % 700);
      
      // 设置子弹位置和速度
      bullet.setPosition(x, -20);
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(150 + (pseudoRandom % 100)); // 150-250速度
      
      // 添加自定义更新方法
      bullet.preUpdate = function(time, delta) {
        // 超出屏幕底部时回收
        if (this.y > 620) {
          this.scene.recycleBullet(this);
        }
      };
      
      console.log(`[SPAWN] Bullet #${this.spawnCount} at x=${x.toFixed(0)}, Active: ${this.bulletPool.countActive(true)}`);
    } else {
      console.log(`[POOL FULL] Cannot spawn, active: ${this.bulletPool.countActive(true)}`);
    }
  }

  recycleBullet(bullet) {
    this.recycleCount++;
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);
    
    console.log(`[RECYCLE] Bullet recycled, Active: ${this.bulletPool.countActive(true)}, Total recycled: ${this.recycleCount}`);
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    
    // 更新显示文本
    this.statsText.setText([
      `=== Object Pool Stats ===`,
      `Active Objects: ${activeCount}`,
      `Pool Size: ${totalCount}/${this.maxBullets}`,
      `Total Spawned: ${this.spawnCount}`,
      `Total Recycled: ${this.recycleCount}`,
      `Reuse Rate: ${this.recycleCount > 0 ? ((this.recycleCount / this.spawnCount) * 100).toFixed(1) : 0}%`
    ]);

    // 更新全局信号
    window.__signals__ = {
      activeCount: activeCount,
      totalSpawned: this.spawnCount,
      totalRecycled: this.recycleCount,
      poolSize: this.maxBullets,
      reuseRate: this.recycleCount > 0 ? (this.recycleCount / this.spawnCount) : 0,
      timestamp: Date.now()
    };
  }

  update(time, delta) {
    // 主更新循环（物理系统会自动更新子弹）
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
  scene: BulletPoolScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始信号
console.log('[INIT] Object Pool Test Started');
console.log('[CONFIG] Max bullets:', 12);
console.log('[CONFIG] Spawn interval: 200ms');