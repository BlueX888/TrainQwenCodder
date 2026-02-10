class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.activeCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建白色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建对象池 - 使用 Physics Group
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      createCallback: (bullet) => {
        // 初始化回调
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建信息显示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 创建统计信息文本
    this.statsText = this.add.text(10, 120, '', {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 设置定时器：每秒生成 12 个子弹
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnBullets,
      callbackScope: this,
      loop: true
    });

    // 初始化随机种子（确保行为可重现）
    Phaser.Math.RND.sow(['pool-test-seed']);

    // 更新显示
    this.updateInfo();
  }

  spawnBullets() {
    const bulletsToSpawn = 12;
    
    for (let i = 0; i < bulletsToSpawn; i++) {
      // 从对象池获取或创建子弹
      const bullet = this.bulletPool.get();
      
      if (bullet) {
        // 随机位置（屏幕上方）
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(-50, 50);
        
        // 激活并设置位置
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setPosition(x, y);
        
        // 设置随机速度（向下和随机水平方向）
        const velocityX = Phaser.Math.Between(-100, 100);
        const velocityY = Phaser.Math.Between(150, 300);
        bullet.setVelocity(velocityX, velocityY);
        
        // 设置旋转速度
        bullet.setAngularVelocity(Phaser.Math.Between(-200, 200));
        
        this.totalSpawned++;
      }
    }
  }

  update() {
    // 检查并回收超出边界的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否超出屏幕边界
        if (bullet.y > 650 || bullet.x < -50 || bullet.x > 850) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新活动对象计数
    this.activeCount = this.bulletPool.countActive(true);
    
    // 更新显示
    this.updateInfo();
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    bullet.setAngularVelocity(0);
    this.totalRecycled++;
  }

  updateInfo() {
    // 获取对象池统计信息
    const totalInPool = this.bulletPool.getLength();
    const activeObjects = this.bulletPool.countActive(true);
    const inactiveObjects = this.bulletPool.countActive(false);
    
    // 更新主信息文本
    this.infoText.setText([
      '=== 对象池压力测试 ===',
      `活动对象: ${activeObjects}`,
      `池中总数: ${totalInPool}`,
      `闲置对象: ${inactiveObjects}`,
      `池容量: ${this.bulletPool.maxSize}`
    ]);

    // 更新统计信息
    this.statsText.setText([
      '--- 统计信息 ---',
      `累计生成: ${this.totalSpawned}`,
      `累计回收: ${this.totalRecycled}`,
      `回收率: ${this.totalSpawned > 0 ? ((this.totalRecycled / this.totalSpawned) * 100).toFixed(1) : 0}%`,
      '',
      '每秒生成 12 个子弹',
      '超出边界自动回收'
    ]);
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