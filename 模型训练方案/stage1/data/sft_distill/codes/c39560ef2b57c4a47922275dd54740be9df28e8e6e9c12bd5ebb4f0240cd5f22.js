class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.stats = {
      totalSpawned: 0,
      totalRecycled: 0,
      activeCount: 0,
      maxActive: 0
    };
  }

  preload() {
    // 使用 Graphics 创建红色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 15,  // 对象池最大容量
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建统计信息文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    this.statsText.setDepth(1000);

    // 创建说明文本
    this.add.text(10, 150, 
      '对象池压力测试\n' +
      '- 每0.2秒生成一个子弹\n' +
      '- 对象池最大容量: 15\n' +
      '- 子弹超出屏幕自动回收\n' +
      '- 观察活动对象数量不超过15', 
      {
        fontSize: '14px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );

    // 持续生成子弹的定时器 (每200ms生成一个)
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
      // 随机起始位置 (使用固定种子的伪随机)
      const seed = this.stats.totalSpawned;
      const x = 50 + ((seed * 73) % 700);  // 伪随机 x 位置
      const y = -20;

      // 激活子弹
      bullet.setPosition(x, y);
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;

      // 设置速度 (略有差异避免重叠)
      const velocityY = 150 + ((seed * 37) % 100);
      bullet.setVelocity(0, velocityY);

      this.stats.totalSpawned++;
      this.updateStats();
    }
  }

  update() {
    // 检查并回收超出屏幕的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.y > this.cameras.main.height + 50) {
        this.recycleBullet(bullet);
      }
    });

    // 更新活动对象统计
    this.updateStats();
  }

  recycleBullet(bullet) {
    if (!bullet.active) return;

    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    bullet.setVelocity(0, 0);

    this.stats.totalRecycled++;
  }

  updateStats() {
    // 计算当前活动对象数量
    this.stats.activeCount = this.bulletPool.countActive(true);
    this.stats.maxActive = Math.max(this.stats.maxActive, this.stats.activeCount);

    // 更新显示
    this.statsText.setText([
      `=== 对象池状态 ===`,
      `活动对象: ${this.stats.activeCount} / 15`,
      `历史最大: ${this.stats.maxActive}`,
      `总生成数: ${this.stats.totalSpawned}`,
      `总回收数: ${this.stats.totalRecycled}`,
      `池中总数: ${this.bulletPool.getLength()}`,
      ``,
      `验证: ${this.stats.activeCount <= 15 ? '✓ 通过' : '✗ 失败'}`
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

// 启动游戏
new Phaser.Game(config);