class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;  // 总生成次数（可验证状态）
    this.recycleCount = 0;   // 回收次数（可验证状态）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 1. 程序化生成红色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 2. 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20,  // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 3. 创建显示文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 4. 设置定时器：每秒生成8个子弹
    this.time.addEvent({
      delay: 125,  // 125ms * 8 = 1秒生成8个
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 5. 更新统计信息
    this.updateStats();
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      // 随机生成位置（使用确定性随机）
      const seed = this.totalSpawned;
      const x = 50 + (seed * 137.5) % 700;  // 伪随机 x 坐标
      const y = 50;

      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(x, y);
      
      // 设置向下的速度
      bullet.body.setVelocity(0, 200 + (seed % 3) * 50);  // 速度有变化
      
      this.totalSpawned++;
    }
  }

  update() {
    // 检查并回收超出边界的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.y > 650) {
        this.recycleBullet(bullet);
      }
    });

    // 更新统计信息
    this.updateStats();
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);
    this.recycleCount++;
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const poolSize = this.bulletPool.getLength();
    
    this.statsText.setText([
      `=== 对象池压力测试 ===`,
      `活动对象: ${activeCount}`,
      `对象池大小: ${poolSize}`,
      `总生成次数: ${this.totalSpawned}`,
      `回收次数: ${this.recycleCount}`,
      `池利用率: ${poolSize > 0 ? ((activeCount / poolSize) * 100).toFixed(1) : 0}%`
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