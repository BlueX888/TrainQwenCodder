class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20, // 最大对象数量
      runChildUpdate: true,
      createCallback: (bullet) => {
        bullet.body.onWorldBounds = true;
      }
    });

    // 监听世界边界碰撞事件来回收子弹
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject && this.bulletPool.contains(body.gameObject)) {
        this.recycleBullet(body.gameObject);
      }
    });

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建信息显示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建状态信息文本（用于验证）
    this.statusText = this.add.text(10, 80, '', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置定时器，每200ms生成一个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 200,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 初始化随机数生成器（使用固定种子）
    this.rng = this.createSeededRandom(this.seed);

    // 更新显示
    this.updateDisplay();
  }

  // 创建带种子的随机数生成器
  createSeededRandom(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  spawnBullet() {
    // 尝试从对象池获取或创建子弹
    let bullet = this.bulletPool.get();

    if (bullet) {
      // 随机生成位置（屏幕顶部）
      const x = this.rng() * 760 + 20; // 20-780之间
      const y = -20;

      // 激活并设置子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(x, y);
      bullet.body.setCollideWorldBounds(true);
      bullet.body.onWorldBounds = true;

      // 随机设置速度
      const velocityX = (this.rng() - 0.5) * 200; // -100到100
      const velocityY = this.rng() * 150 + 100; // 100到250
      bullet.setVelocity(velocityX, velocityY);

      this.totalSpawned++;
      this.updateDisplay();
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.stop();
    bullet.body.setCollideWorldBounds(false);

    this.totalRecycled++;
    this.updateDisplay();
  }

  updateDisplay() {
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();

    this.infoText.setText([
      `活动对象: ${activeCount} / ${totalCount}`,
      `总生成数: ${this.totalSpawned}`,
      `总回收数: ${this.totalRecycled}`,
      `对象池大小: ${this.bulletPool.maxSize}`
    ]);

    // 状态信号（用于验证）
    this.statusText.setText([
      `[状态验证]`,
      `active: ${activeCount}`,
      `spawned: ${this.totalSpawned}`,
      `recycled: ${this.totalRecycled}`,
      `pool_efficiency: ${totalCount <= 20 ? 'OK' : 'OVERFLOW'}`
    ]);
  }

  update(time, delta) {
    // 更新显示（每帧）
    this.updateDisplay();

    // 手动检查超出边界的子弹（额外保险）
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.y > 620 || bullet.x < -20 || bullet.x > 820) {
          this.recycleBullet(bullet);
        }
      }
    });
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
new Phaser.Game(config);