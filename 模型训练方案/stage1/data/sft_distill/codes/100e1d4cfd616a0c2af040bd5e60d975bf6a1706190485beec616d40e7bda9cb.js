class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建绿色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建对象池 (Physics Group)
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20, // 对象池最大容量
      runChildUpdate: true
    });

    // 创建信息文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 创建边界检测区域
    this.physics.world.setBounds(0, 0, 800, 600);

    // 每秒生成5个子弹
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnBullets,
      callbackScope: this,
      loop: true
    });

    // 每帧更新统计信息
    this.updateStats();
  }

  spawnBullets() {
    // 每次生成5个子弹
    for (let i = 0; i < 5; i++) {
      this.spawnBullet();
    }
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get(400, 300);
    
    if (bullet) {
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置随机速度 (使用确定性随机)
      const seed = this.totalSpawned;
      const angle = (seed * 137.5) % 360; // 黄金角度分布
      const speed = 100 + (seed % 5) * 50;
      
      const velocityX = Math.cos(angle * Math.PI / 180) * speed;
      const velocityY = Math.sin(angle * Math.PI / 180) * speed;
      
      bullet.setVelocity(velocityX, velocityY);
      
      // 启用边界检测
      bullet.setCollideWorldBounds(false);
      
      // 记录生成数据
      bullet.setData('spawnTime', this.time.now);
      
      this.totalSpawned++;
    }
  }

  update(time, delta) {
    // 检查并回收超出边界的子弹
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 检查是否超出边界
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          this.recycleBullet(bullet);
        }
      }
    });

    this.updateStats();
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    this.totalRecycled++;
  }

  updateStats() {
    // 计算活动对象数量
    const activeCount = this.bulletPool.countActive(true);
    const inactiveCount = this.bulletPool.countActive(false);
    const totalInPool = this.bulletPool.getLength();

    // 更新显示文本
    this.statsText.setText([
      '=== 对象池压力测试 ===',
      `活动对象: ${activeCount}`,
      `池中待用: ${inactiveCount}`,
      `池总容量: ${totalInPool} / ${this.bulletPool.maxSize}`,
      `总生成数: ${this.totalSpawned}`,
      `总回收数: ${this.totalRecycled}`,
      `净增长: ${this.totalSpawned - this.totalRecycled}`,
      '',
      '每秒生成5个绿色子弹',
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
  scene: BulletPoolScene
};

// 启动游戏
new Phaser.Game(config);