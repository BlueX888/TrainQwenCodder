class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.spawnCount = 0;
    this.recycleCount = 0;
  }

  preload() {
    // 创建紫色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12, // 对象池最大容量
      runChildUpdate: true,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建信息显示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 创建状态文本（用于验证）
    this.statusText = this.add.text(10, 100, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时器：每0.3秒生成一个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 300,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 初始化状态变量
    this.updateInfo();
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get();

    if (bullet) {
      // 随机生成位置（使用确定性种子）
      const seed = this.spawnCount;
      const x = 100 + (seed * 137.508) % 600; // 黄金角度分布
      const y = 50;

      // 激活子弹
      bullet.setPosition(x, y);
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocity(0, 200); // 向下移动

      this.spawnCount++;
      this.updateInfo();
    }
  }

  update() {
    // 检查并回收离开屏幕的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.y > 620) {
        this.recycleBullet(bullet);
      }
    });

    this.updateInfo();
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    this.recycleCount++;
  }

  updateInfo() {
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    const poolSize = this.bulletPool.maxSize;

    this.infoText.setText([
      '=== 对象池压力测试 ===',
      `活动对象数: ${activeCount}`,
      `池中总对象: ${totalCount}`,
      `池最大容量: ${poolSize}`,
      `总生成次数: ${this.spawnCount}`,
      `总回收次数: ${this.recycleCount}`,
      `内存复用率: ${this.recycleCount > 0 ? ((this.recycleCount / this.spawnCount) * 100).toFixed(1) : 0}%`
    ]);

    // 状态验证信号
    this.statusText.setText([
      '=== 验证状态 ===',
      `ACTIVE: ${activeCount}`,
      `SPAWNED: ${this.spawnCount}`,
      `RECYCLED: ${this.recycleCount}`,
      `POOL_OK: ${totalCount <= poolSize ? 'YES' : 'NO'}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
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