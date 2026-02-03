class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;
    this.recycledCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 8,
      runChildUpdate: true
    });

    // 预创建 8 个子弹对象（初始化对象池）
    for (let i = 0; i < 8; i++) {
      const bullet = this.bulletPool.create(-100, -100, 'bullet');
      bullet.setActive(false);
      bullet.setVisible(false);
    }

    // 显示统计信息
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 显示对象池信息
    this.poolInfoText = this.add.text(10, 100, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 显示说明
    this.add.text(10, 200, 'Object Pool Stress Test\nMax Pool Size: 8\nSpawn Rate: 500ms', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 创建定时器，每 500ms 生成一个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 500,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新统计信息
    this.updateStats();
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get();

    if (bullet) {
      // 随机生成位置（屏幕上方）
      const x = Phaser.Math.Between(50, 750);
      const y = 0;

      // 激活并显示子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(x, y);

      // 设置随机速度
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(150, 300);
      bullet.setVelocity(velocityX, velocityY);

      // 增加生成计数
      this.totalSpawned++;

      // 标记子弹以便追踪
      bullet.spawnTime = this.time.now;
    }
  }

  update(time, delta) {
    // 检查并回收离开屏幕的子弹
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 子弹超出屏幕边界时回收
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
    bullet.setPosition(-100, -100);
    bullet.setVelocity(0, 0);

    // 增加回收计数
    this.recycledCount++;
  }

  updateStats() {
    // 计算活动对象数量
    const activeCount = this.bulletPool.countActive(true);
    const inactiveCount = this.bulletPool.countActive(false);
    const totalInPool = this.bulletPool.getLength();

    // 更新统计文本
    this.statsText.setText([
      `Total Spawned: ${this.totalSpawned}`,
      `Recycled: ${this.recycledCount}`,
      `Active Objects: ${activeCount}`,
      `Inactive Objects: ${inactiveCount}`
    ]);

    // 更新对象池信息
    this.poolInfoText.setText([
      `Pool Size: ${totalInPool} / ${this.bulletPool.maxSize}`,
      `Pool Full: ${totalInPool >= this.bulletPool.maxSize ? 'YES' : 'NO'}`,
      `Reuse Rate: ${this.totalSpawned > 0 ? ((this.recycledCount / this.totalSpawned) * 100).toFixed(1) : 0}%`
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