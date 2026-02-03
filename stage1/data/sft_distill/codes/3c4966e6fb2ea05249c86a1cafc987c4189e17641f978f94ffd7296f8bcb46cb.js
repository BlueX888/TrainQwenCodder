class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.activeCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建黄色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20, // 对象池最大容量
      runChildUpdate: true,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建统计文本
    this.statsText = this.add.text(16, 60, '', {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置定时器：每500ms生成12个子弹
    this.time.addEvent({
      delay: 500,
      callback: this.spawnBullets,
      callbackScope: this,
      loop: true
    });

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 初始化随机种子（确保可重现性）
    Phaser.Math.RND.srand(['bullet-pool-test']);
  }

  spawnBullets() {
    const bulletsToSpawn = 12;
    
    for (let i = 0; i < bulletsToSpawn; i++) {
      // 从对象池获取或创建子弹
      let bullet = this.bulletPool.get();
      
      if (bullet) {
        // 随机位置（屏幕上半部分）
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 200);
        
        // 激活子弹
        bullet.setPosition(x, y);
        bullet.setActive(true);
        bullet.setVisible(true);
        
        // 设置随机速度
        const velocityX = Phaser.Math.Between(-200, 200);
        const velocityY = Phaser.Math.Between(100, 300);
        bullet.setVelocity(velocityX, velocityY);
        
        // 设置生命周期（2-4秒后回收）
        bullet.lifespan = Phaser.Math.Between(2000, 4000);
        bullet.spawnTime = this.time.now;
        
        // 更新统计
        this.totalSpawned++;
      }
    }
  }

  update(time, delta) {
    // 更新活动对象计数
    this.activeCount = this.bulletPool.countActive(true);
    
    // 检查并回收子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查生命周期
        if (time - bullet.spawnTime > bullet.lifespan) {
          this.recycleBullet(bullet);
          return;
        }
        
        // 检查是否超出边界
        if (bullet.y > 650 || bullet.x < -50 || bullet.x > 850) {
          this.recycleBullet(bullet);
          return;
        }
      }
    });

    // 更新显示文本
    this.statusText.setText([
      `Active Bullets: ${this.activeCount}`,
      `Pool Size: ${this.bulletPool.getLength()}`,
      `Pool Capacity: ${this.bulletPool.maxSize}`
    ]);

    this.statsText.setText([
      `Total Spawned: ${this.totalSpawned}`,
      `Total Recycled: ${this.totalRecycled}`,
      `Reuse Rate: ${this.totalSpawned > 0 ? 
        ((this.totalRecycled / this.totalSpawned) * 100).toFixed(1) : 0}%`
    ]);
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    this.totalRecycled++;
    
    // 将子弹放回对象池（Group 会自动管理）
    // 不需要显式调用，设置 active=false 即可
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
  scene: BulletPoolScene
};

new Phaser.Game(config);