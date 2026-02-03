class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建红色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 限制对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建信息显示文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    this.statsText.setDepth(100);

    // 创建说明文本
    this.add.text(10, 150, 
      '对象池压力测试\n每秒生成8个子弹\n超出屏幕自动回收', 
      {
        fontSize: '16px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 }
      }
    );

    // 定时器：每秒生成8个子弹
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
    const bulletsToSpawn = 8;
    
    for (let i = 0; i < bulletsToSpawn; i++) {
      // 从对象池获取或创建子弹
      let bullet = this.bulletPool.get();
      
      if (bullet) {
        // 随机X位置
        const x = Phaser.Math.Between(50, 750);
        const y = -20;
        
        // 激活并设置位置
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setPosition(x, y);
        
        // 设置速度（向下移动，带轻微随机偏移）
        const velocityX = Phaser.Math.Between(-50, 50);
        const velocityY = Phaser.Math.Between(150, 250);
        bullet.setVelocity(velocityX, velocityY);
        
        this.totalSpawned++;
      }
    }
    
    this.updateStats();
  }

  update() {
    // 检查并回收超出屏幕的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 超出屏幕底部或左右边界
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
    const inactiveCount = totalInPool - activeCount;
    
    this.statsText.setText([
      `活动对象: ${activeCount}`,
      `池中对象: ${totalInPool}`,
      `闲置对象: ${inactiveCount}`,
      `总生成: ${this.totalSpawned}`,
      `总回收: ${this.totalRecycled}`,
      `池最大容量: ${this.bulletPool.maxSize}`
    ]);
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