class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建对象池（使用 Physics Group）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建边界检测区域
    this.worldBounds = new Phaser.Geom.Rectangle(
      -50, -50, 
      this.scale.width + 100, 
      this.scale.height + 100
    );

    // 设置定时器：每秒生成8个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnBullets,
      callbackScope: this,
      loop: true
    });

    // 立即生成第一批
    this.spawnBullets();

    // 更新状态显示
    this.updateStatus();
  }

  spawnBullets() {
    const bulletsToSpawn = 8;
    
    for (let i = 0; i < bulletsToSpawn; i++) {
      // 从对象池获取或创建子弹
      let bullet = this.bulletPool.get();
      
      if (!bullet) {
        // 如果对象池已满，跳过
        console.warn('Object pool is full, skipping spawn');
        continue;
      }

      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);

      // 随机位置（从屏幕中心区域生成）
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;
      const offsetX = Phaser.Math.Between(-100, 100);
      const offsetY = Phaser.Math.Between(-100, 100);
      
      bullet.setPosition(centerX + offsetX, centerY + offsetY);

      // 随机速度和方向
      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(100, 300);
      
      this.physics.velocityFromAngle(angle, speed, bullet.body.velocity);

      this.totalSpawned++;
    }

    this.updateStatus();
  }

  update(time, delta) {
    // 检查所有活动子弹
    const activeBullets = this.bulletPool.getChildren().filter(b => b.active);
    
    activeBullets.forEach(bullet => {
      // 检查是否出界
      if (!this.worldBounds.contains(bullet.x, bullet.y)) {
        this.recycleBullet(bullet);
      }
    });

    this.updateStatus();
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.velocity.set(0, 0);
    
    this.totalRecycled++;
  }

  updateStatus() {
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    const poolCapacity = this.bulletPool.maxSize;

    this.statusText.setText([
      `Active Objects: ${activeCount}`,
      `Pool Size: ${totalCount} / ${poolCapacity}`,
      `Total Spawned: ${this.totalSpawned}`,
      `Total Recycled: ${this.totalRecycled}`,
      `Pool Efficiency: ${totalCount <= poolCapacity ? 'GOOD' : 'OVERFLOW'}`
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
  scene: BulletPoolScene,
  // 设置随机种子以保证确定性
  seed: [(Date.now() * Math.random()).toString()]
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态验证接口
if (typeof window !== 'undefined') {
  window.getGameState = function() {
    const scene = game.scene.scenes[0];
    return {
      activeObjects: scene.bulletPool.countActive(true),
      totalSpawned: scene.totalSpawned,
      totalRecycled: scene.totalRecycled,
      poolSize: scene.bulletPool.getLength(),
      poolCapacity: scene.bulletPool.maxSize
    };
  };
}