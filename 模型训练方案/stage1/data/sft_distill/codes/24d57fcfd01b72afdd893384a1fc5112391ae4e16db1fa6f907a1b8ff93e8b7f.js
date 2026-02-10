class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 无需加载外部资源
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
      maxSize: 20,
      runChildUpdate: true
    });

    // 配置对象池的默认行为
    this.bulletPool.createMultiple({
      key: 'bullet',
      quantity: 0,
      active: false,
      visible: false
    });

    // 创建显示文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 创建说明文本
    this.add.text(10, 100, '对象池压力测试\n持续生成/回收子弹\n池大小: 20', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置定时器持续生成子弹
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
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get();

    if (bullet) {
      // 随机生成位置（顶部）
      const x = Phaser.Math.Between(50, 750);
      const y = 0;

      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(x, y);

      // 设置随机速度
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(150, 300);
      bullet.setVelocity(velocityX, velocityY);

      // 添加旋转效果
      bullet.setAngularVelocity(Phaser.Math.Between(-200, 200));

      this.totalSpawned++;

      // 自定义更新函数：检查边界
      bullet.update = () => {
        if (bullet.y > 650 || bullet.x < -50 || bullet.x > 850) {
          this.recycleBullet(bullet);
        }
      };
    }

    this.updateStats();
  }

  recycleBullet(bullet) {
    if (bullet.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body.stop();
      this.totalRecycled++;
      this.updateStats();
    }
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const inactiveCount = this.bulletPool.countActive(false);
    const totalInPool = this.bulletPool.getLength();

    this.statsText.setText([
      `活动对象: ${activeCount}`,
      `池中闲置: ${inactiveCount}`,
      `池总容量: ${totalInPool}/20`,
      `总生成数: ${this.totalSpawned}`,
      `总回收数: ${this.totalRecycled}`,
      `重用率: ${this.totalSpawned > 0 ? ((this.totalRecycled / this.totalSpawned) * 100).toFixed(1) : 0}%`
    ]);
  }

  update(time, delta) {
    // 统计信息每帧更新
    this.updateStats();

    // 手动检查所有活动子弹（双重保险）
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active && bullet.update) {
        bullet.update();
      }
    });
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
  scene: PoolTestScene,
  seed: [(Date.now() * Math.random()).toString()]
};

const game = new Phaser.Game(config);

// 导出状态用于验证
game.getPoolStats = function() {
  const scene = game.scene.scenes[0];
  return {
    active: scene.bulletPool.countActive(true),
    inactive: scene.bulletPool.countActive(false),
    totalSpawned: scene.totalSpawned,
    totalRecycled: scene.totalRecycled,
    poolSize: scene.bulletPool.getLength()
  };
};