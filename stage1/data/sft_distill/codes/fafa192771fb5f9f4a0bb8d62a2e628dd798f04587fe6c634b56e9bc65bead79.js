class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建绿色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建统计文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 设置定时器：每秒生成5个子弹
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnBullets,
      callbackScope: this,
      loop: true
    });

    // 初始生成一批
    this.spawnBullets();

    // 更新统计信息
    this.updateStats();
  }

  spawnBullets() {
    const bulletsToSpawn = 5;
    
    for (let i = 0; i < bulletsToSpawn; i++) {
      // 从对象池获取或创建子弹
      let bullet = this.bulletPool.get();
      
      if (bullet) {
        // 随机位置（使用固定种子保证可重现）
        const x = 100 + (this.totalSpawned * 37) % 600;
        const y = 50;
        
        // 激活并设置位置
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setPosition(x, y);
        
        // 设置随机速度
        const velocityX = -50 + ((this.totalSpawned * 73) % 100);
        const velocityY = 100 + ((this.totalSpawned * 53) % 200);
        bullet.setVelocity(velocityX, velocityY);
        
        this.totalSpawned++;
      }
    }
  }

  update(time, delta) {
    // 检查并回收超出边界的子弹
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 超出屏幕边界则回收
        if (bullet.y > 650 || bullet.x < -50 || bullet.x > 850) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新统计信息
    this.updateStats();
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    this.totalRecycled++;
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const totalInPool = this.bulletPool.getLength();
    
    const statsText = [
      `=== 对象池压力测试 ===`,
      `活动对象数: ${activeCount}`,
      `池中总对象: ${totalInPool}`,
      `累计生成: ${this.totalSpawned}`,
      `累计回收: ${this.totalRecycled}`,
      `池利用率: ${((activeCount / totalInPool) * 100).toFixed(1)}%`,
      ``,
      `每秒生成5个子弹`,
      `超出边界自动回收`
    ];
    
    this.statsText.setText(statsText.join('\n'));
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
  scene: PoolTestScene
};

// 启动游戏
new Phaser.Game(config);