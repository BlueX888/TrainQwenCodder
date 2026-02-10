class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建白色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12,
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 初始化随机数生成器
    this.rng = new Phaser.Math.RandomDataGenerator([this.seed]);

    // 创建显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 创建定时器，每500ms生成一个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 500,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 添加说明文本
    this.add.text(10, 80, 'Object Pool Stress Test\nMax Pool Size: 12\nSpawn Rate: 500ms', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化统计变量
    this.activeCount = 0;
    this.recycledCount = 0;
  }

  spawnBullet() {
    // 尝试从对象池获取子弹
    let bullet = this.bulletPool.get();

    if (bullet) {
      // 随机生成位置（从屏幕中央区域）
      const x = this.rng.between(100, 700);
      const y = this.rng.between(100, 500);

      // 激活并显示子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(x, y);

      // 设置随机速度
      const velocityX = this.rng.between(-200, 200);
      const velocityY = this.rng.between(-200, 200);
      bullet.setVelocity(velocityX, velocityY);

      // 添加边界检测标记
      bullet.setData('spawned', true);

      this.totalSpawned++;
    } else {
      // 对象池已满，无法生成新对象
      console.log('Pool is full, cannot spawn more bullets');
    }
  }

  recycleBullet(bullet) {
    if (bullet.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.setVelocity(0, 0);
      bullet.setData('spawned', false);
      this.recycledCount++;
    }
  }

  update(time, delta) {
    // 统计活动对象数量
    this.activeCount = 0;

    // 检查所有子弹是否超出边界
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        this.activeCount++;

        // 检查是否超出屏幕边界
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `Active Objects: ${this.activeCount} / 12`,
      `Total Spawned: ${this.totalSpawned}`,
      `Total Recycled: ${this.recycledCount}`,
      `Pool Size: ${this.bulletPool.getLength()}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);

    // 验证状态信号
    this.verifyPoolIntegrity();
  }

  verifyPoolIntegrity() {
    // 确保对象池不会无限增长
    const poolSize = this.bulletPool.getLength();
    if (poolSize > 12) {
      console.error('Pool size exceeded limit!', poolSize);
    }

    // 确保活动对象数量不超过池大小
    if (this.activeCount > poolSize) {
      console.error('Active count exceeds pool size!');
    }
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