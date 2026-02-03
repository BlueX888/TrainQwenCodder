class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.spawnCount = 0;
    this.recycleCount = 0;
  }

  preload() {
    // 创建灰色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x808080, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 初始化信号输出
    window.__signals__ = {
      activeCount: 0,
      spawnCount: 0,
      recycleCount: 0,
      poolSize: 15,
      timestamp: Date.now(),
      events: []
    };

    // 创建对象池 - 使用物理组
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 15,
      runChildUpdate: true
    });

    // 配置边界检测
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建显示文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时生成子弹 - 每500ms生成一个
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
    // 尝试从对象池获取或创建子弹
    let bullet = this.bulletPool.get(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置随机速度
      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(100, 300);
      this.physics.velocityFromAngle(angle, speed, bullet.body.velocity);

      // 设置边界碰撞回调
      bullet.body.onWorldBounds = true;
      
      this.spawnCount++;
      
      // 记录生成事件
      window.__signals__.events.push({
        type: 'spawn',
        count: this.spawnCount,
        active: this.bulletPool.countActive(true),
        time: Date.now() - window.__signals__.timestamp
      });

      this.updateStats();
    }
  }

  update(time, delta) {
    // 检查并回收超出边界的子弹
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (bullet.x < bounds.x - 20 || bullet.x > bounds.right + 20 ||
            bullet.y < bounds.y - 20 || bullet.y > bounds.bottom + 20) {
          this.recycleBullet(bullet);
        }
      }
    });
  }

  recycleBullet(bullet) {
    if (bullet.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body.velocity.set(0, 0);
      
      this.recycleCount++;
      
      // 记录回收事件
      window.__signals__.events.push({
        type: 'recycle',
        count: this.recycleCount,
        active: this.bulletPool.countActive(true),
        time: Date.now() - window.__signals__.timestamp
      });

      this.updateStats();
    }
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    
    this.statsText.setText([
      '=== 对象池压力测试 ===',
      `活动对象: ${activeCount} / ${totalCount}`,
      `对象池容量: 15`,
      `已生成: ${this.spawnCount}`,
      `已回收: ${this.recycleCount}`,
      `池利用率: ${((activeCount / 15) * 100).toFixed(1)}%`
    ]);

    // 更新全局信号
    window.__signals__.activeCount = activeCount;
    window.__signals__.spawnCount = this.spawnCount;
    window.__signals__.recycleCount = this.recycleCount;
    window.__signals__.utilization = (activeCount / 15) * 100;
    window.__signals__.totalInPool = totalCount;

    // 输出到控制台（可验证）
    if (this.spawnCount % 5 === 0 && this.spawnCount > 0) {
      console.log(JSON.stringify({
        activeCount,
        spawnCount: this.spawnCount,
        recycleCount: this.recycleCount,
        poolSize: 15
      }));
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