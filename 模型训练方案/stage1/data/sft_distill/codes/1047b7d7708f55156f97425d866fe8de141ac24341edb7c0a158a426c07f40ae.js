class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
    this.seed = 12345; // 固定随机种子保证确定性
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
    // 初始化随机数生成器（确定性）
    this.rng = new Phaser.Math.RandomDataGenerator([this.seed]);

    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12, // 最大对象数量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建边界检测区域
    this.physics.world.setBounds(0, 0, 800, 600);

    // 显示统计信息
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建定时器，每200ms生成一个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 200,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新统计信息
    this.updateStats();
  }

  spawnBullet() {
    // 从对象池获取子弹
    const bullet = this.bulletPool.get();

    if (bullet) {
      // 随机生成位置（从屏幕顶部）
      const x = this.rng.between(50, 750);
      const y = -20;

      // 激活并设置位置
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(x, y);

      // 设置随机速度（向下和随机水平方向）
      const velocityX = this.rng.between(-100, 100);
      const velocityY = this.rng.between(150, 300);
      bullet.setVelocity(velocityX, velocityY);

      // 启用物理体
      bullet.body.enable = true;

      this.totalSpawned++;
    }
  }

  update(time, delta) {
    // 检查并回收超出边界的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否超出屏幕边界
        if (bullet.y > 620 || bullet.x < -20 || bullet.x > 820) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新统计信息
    this.updateStats();
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    bullet.body.enable = false;
    
    this.totalRecycled++;
  }

  updateStats() {
    // 计算当前活动对象数量
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    const poolSize = this.bulletPool.maxSize;

    // 更新显示文本
    this.statsText.setText([
      `对象池压力测试`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `活动对象: ${activeCount} / ${poolSize}`,
      `池中总对象: ${totalCount}`,
      `总生成次数: ${this.totalSpawned}`,
      `总回收次数: ${this.totalRecycled}`,
      `生成-回收差: ${this.totalSpawned - this.totalRecycled}`
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
  scene: BulletPoolScene
};

// 创建游戏实例
new Phaser.Game(config);